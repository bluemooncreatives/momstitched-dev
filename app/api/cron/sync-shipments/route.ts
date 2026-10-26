import { timingSafeEqual } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/databaseConnection"
import { syncOrderShipment } from "@/lib/services/shipmentTrackingService"
import OrderModel from "@/models/Order.model"
import { adminAlert } from "@/email/adminAlert"
import { ADMIN_EVENT } from "@/lib/adminNotificationEvents"
import { adminUrl, notifyAdmins } from "@/lib/services/notificationService"
import { ADMIN_ORDER_DETAILS, ADMIN_ORDER_SHOW } from "@/routes/AdminPanelRoute"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 300

const Order = OrderModel as any
const BATCH_SIZE = 100
const CONCURRENCY = 5

type SyncCandidate = {
    _id: { toString: () => string }
    order_id: string
    name?: string
    shipment: {
        awb: string
        shipmentStatus?: string | null
        deliveredAt?: Date | string | null
    }
}

type SyncFailure = {
    orderId: string
    awb: string
    message: string
}

const log = (
    level: "info" | "warn" | "error",
    event: string,
    context: Record<string, unknown> = {},
) => {
    console[level](JSON.stringify({
        service: "shipment-sync-cron",
        event,
        timestamp: new Date().toISOString(),
        ...context,
    }))
}

const isAuthorized = (request: NextRequest) => {
    const secret = process.env.CRON_SECRET
    const authorization = request.headers.get("authorization") || ""
    if (!secret) return false

    const actual = Buffer.from(authorization)
    const expected = Buffer.from(`Bearer ${secret}`)
    return actual.length === expected.length && timingSafeEqual(actual, expected)
}

const errorMessage = (error: unknown) => error instanceof Error ? error.message : "Unknown sync error."

const ISSUE_STATUSES = new Set(["RTO", "CANCELLED"])
const ISSUE_LABEL: Record<string, string> = {
    RTO: "is returning to origin (RTO)",
    CANCELLED: "was cancelled by the courier",
}

/**
 * Tell the admin team about courier-side transitions they did not trigger.
 * Only fires on an actual status change, and the dedupe key includes the new
 * status, so re-running the cron never repeats an alert.
 */
const notifyShipmentChange = async (order: SyncCandidate, nextStatus: string) => {
    const isDelivered = nextStatus === "DELIVERED"
    if (!isDelivered && !ISSUE_STATUSES.has(nextStatus)) return

    const customer = order.name || "the customer"
    const title = isDelivered
        ? `Order ${order.order_id} delivered`
        : `Order ${order.order_id} ${ISSUE_LABEL[nextStatus]}`
    const message = isDelivered
        ? `Delhivery delivered AWB ${order.shipment.awb} to ${customer}.`
        : `AWB ${order.shipment.awb} for ${customer} needs attention.`
    const link = ADMIN_ORDER_DETAILS(order.order_id)

    await notifyAdmins({
        type: isDelivered ? ADMIN_EVENT.SHIPMENT_DELIVERED : ADMIN_EVENT.SHIPMENT_ISSUE,
        dedupeKey: `shipment:${order._id.toString()}:${order.shipment.awb}:${nextStatus}`,
        title,
        message,
        link,
        meta: { orderId: order.order_id, awb: order.shipment.awb, shipmentStatus: nextStatus },
        email: {
            subject: title,
            html: adminAlert({
                label: isDelivered ? "Shipment Delivered" : "Shipment Problem",
                title,
                intro: message,
                rows: [
                    { label: "Order ID", value: order.order_id },
                    { label: "Customer", value: order.name },
                    { label: "AWB", value: order.shipment.awb },
                    { label: "Courier status", value: nextStatus },
                ],
                ctaLabel: "Open order",
                ctaUrl: adminUrl(link),
            }),
        },
    })
}

export async function GET(request: NextRequest) {
    const startedAt = Date.now()

    if (!process.env.CRON_SECRET) {
        log("error", "cron_not_configured")
        return NextResponse.json(
            { success: false, message: "CRON_SECRET is not configured." },
            { status: 500 },
        )
    }

    if (!isAuthorized(request)) {
        log("warn", "unauthorized_request")
        return NextResponse.json(
            { success: false, message: "Unauthorized." },
            { status: 401 },
        )
    }

    log("info", "sync_started")

    try {
        await connectDB()

        let cursor: SyncCandidate["_id"] | null = null
        let found = 0
        let succeeded = 0
        let failed = 0
        let statusChanged = 0
        const failures: SyncFailure[] = []

        while (true) {
            const query: Record<string, unknown> = {
                deletedAt: null,
                "shipment.awb": { $exists: true, $nin: [null, ""] },
                "shipment.shipmentStatus": { $ne: "DELIVERED" },
                ...(cursor ? { _id: { $gt: cursor } } : {}),
            }

            const orders = await Order.find(query)
                .select("_id order_id name shipment.awb shipment.shipmentStatus shipment.deliveredAt")
                .sort({ _id: 1 })
                .limit(BATCH_SIZE)
                .lean() as SyncCandidate[]

            if (!orders.length) break
            found += orders.length

            for (let index = 0; index < orders.length; index += CONCURRENCY) {
                const chunk = orders.slice(index, index + CONCURRENCY)
                const results = await Promise.allSettled(chunk.map(async (order) => {
                    const previousStatus = order.shipment.shipmentStatus || "PENDING"
                    const tracking = await syncOrderShipment({
                        orderId: order._id.toString(),
                        awb: order.shipment.awb,
                        deliveredAt: order.shipment.deliveredAt,
                    })

                    return { order, previousStatus, tracking }
                }))

                const changes: Promise<unknown>[] = []
                results.forEach((result, resultIndex) => {
                    const order = chunk[resultIndex]
                    if (result.status === "fulfilled") {
                        succeeded += 1
                        if (result.value.previousStatus !== result.value.tracking.shipmentStatus) {
                            statusChanged += 1
                            changes.push(notifyShipmentChange(order, result.value.tracking.shipmentStatus))
                        }
                        log("info", "shipment_synced", {
                            orderId: order.order_id,
                            awb: order.shipment.awb,
                            previousStatus: result.value.previousStatus,
                            shipmentStatus: result.value.tracking.shipmentStatus,
                        })
                        return
                    }

                    failed += 1
                    const failure = {
                        orderId: order.order_id,
                        awb: order.shipment.awb,
                        message: errorMessage(result.reason),
                    }
                    // Keep the response bounded, while still logging every failure.
                    if (failures.length < 25) failures.push(failure)
                    log("error", "shipment_sync_failed", failure)
                })
                await Promise.allSettled(changes)
            }

            cursor = orders[orders.length - 1]._id
            if (orders.length < BATCH_SIZE) break
        }

        const summary = {
            found,
            succeeded,
            failed,
            statusChanged,
            durationMs: Date.now() - startedAt,
            failures,
        }
        log(failed ? "warn" : "info", "sync_completed", summary)

        if (failed) {
            const runDate = new Date(startedAt).toISOString().slice(0, 10)
            const title = `Tracking sync failed for ${failed} of ${found} shipment${found === 1 ? "" : "s"}`
            await notifyAdmins({
                type: ADMIN_EVENT.SHIPMENT_SYNC_FAILED,
                // One alert per day, even if the cron is retried.
                dedupeKey: `${ADMIN_EVENT.SHIPMENT_SYNC_FAILED}:${runDate}`,
                title,
                message: failures.slice(0, 3).map((f) => `${f.orderId}: ${f.message}`).join(" · "),
                link: ADMIN_ORDER_SHOW,
                meta: { found, succeeded, failed, failures: failures.slice(0, 10) },
                email: {
                    subject: title,
                    html: adminAlert({
                        label: "Tracking Sync",
                        title,
                        intro: "The daily Delhivery tracking sync could not update these shipments. Their status in the admin panel may be out of date.",
                        rows: failures.slice(0, 10).map((f) => ({
                            label: `${f.orderId} · AWB ${f.awb}`,
                            value: f.message,
                        })),
                        ctaLabel: "Open orders",
                        ctaUrl: adminUrl(ADMIN_ORDER_SHOW),
                    }),
                },
            })
        }

        const allFailed = found > 0 && succeeded === 0
        return NextResponse.json(
            {
                success: !allFailed,
                message: allFailed
                    ? "All shipment tracking updates failed."
                    : "Shipment tracking sync completed.",
                data: summary,
            },
            { status: allFailed ? 502 : 200 },
        )
    } catch (error) {
        log("error", "sync_crashed", {
            durationMs: Date.now() - startedAt,
            message: errorMessage(error),
        })
        await notifyAdmins({
            type: ADMIN_EVENT.SHIPMENT_SYNC_FAILED,
            dedupeKey: `${ADMIN_EVENT.SHIPMENT_SYNC_FAILED}:${new Date(startedAt).toISOString().slice(0, 10)}`,
            title: "Shipment tracking sync crashed",
            message: errorMessage(error),
            link: ADMIN_ORDER_SHOW,
            email: {
                subject: "Shipment tracking sync crashed",
                html: adminAlert({
                    label: "Tracking Sync",
                    title: "Shipment tracking sync crashed",
                    intro: "The daily Delhivery tracking sync stopped before finishing. No shipment statuses were updated after the error.",
                    rows: [{ label: "Error", value: errorMessage(error) }],
                    ctaLabel: "Open orders",
                    ctaUrl: adminUrl(ADMIN_ORDER_SHOW),
                }),
            },
        })
        return NextResponse.json(
            { success: false, message: "Shipment tracking sync failed." },
            { status: 500 },
        )
    }
}

