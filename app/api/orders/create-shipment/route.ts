import { NextRequest } from "next/server"
import { z } from "zod"
import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import OrderModel, { withDefaultShipment } from "@/models/Order.model"

export const runtime = "nodejs"

const Order = OrderModel as any

type DelhiveryPackage = {
    waybill?: string
    status?: string
    remarks?: string[]
}

type DelhiveryCreateOrderResponse = {
    success?: boolean
    packages?: DelhiveryPackage[]
    package?: DelhiveryPackage
    waybill?: string
    error?: string
    message?: string
    rmk?: string
}

const shipmentSchema = z.object({
    orderId: z.string().min(1, "Order id is required."),
    length: z.coerce.number().positive("Length must be greater than 0."),
    breadth: z.coerce.number().positive("Breadth must be greater than 0."),
    height: z.coerce.number().positive("Height must be greater than 0."),
    weight: z.coerce.number().positive("Weight must be greater than 0."),
})

const cleanDelhiveryText = (value: unknown) => {
    return String(value ?? "")
        .replace(/[&#%;,\\]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
}

const fullAddress = (order: any) => {
    return [
        order.address,
        order.landmark,
        order.city,
        order.state,
        order.pincode,
        order.country,
    ].filter(Boolean).join(" ")
}

const extractAwb = (data: DelhiveryCreateOrderResponse) => {
    return data?.packages?.[0]?.waybill || data?.package?.waybill || data?.waybill || null
}

const extractDelhiveryError = (data: DelhiveryCreateOrderResponse) => {
    const packageError = data?.packages?.[0]?.remarks?.join(" ")
        || data?.packages?.[0]?.status
        || data?.package?.remarks?.join(" ")
        || data?.package?.status

    return data?.error || data?.message || data?.rmk || packageError || "Delhivery did not return an AWB."
}

export async function POST(request: NextRequest) {
    try {
        const auth = await isAuthenticated("admin", request)
        if (!auth.isAuth) {
            return response(false, 403, "Unauthorized.")
        }

        const parsed = shipmentSchema.safeParse(await request.json())
        if (!parsed.success) {
            return response(false, 400, "Invalid shipment details.", { error: parsed.error.flatten() })
        }

        const token = process.env.DELHIVERY_API_TOKEN
        const pickupLocation = process.env.DELHIVERY_PICKUP_LOCATION
        const clientName = process.env.DELHIVERY_CLIENT_NAME

        if (!token || !pickupLocation || !clientName) {
            return response(false, 500, "Delhivery is not configured. Add DELHIVERY_API_TOKEN, DELHIVERY_PICKUP_LOCATION, and DELHIVERY_CLIENT_NAME.")
        }

        await connectDB()

        const order = await Order.findById(parsed.data.orderId)
        if (!order || order.deletedAt) {
            return response(false, 404, "Order not found.")
        }

        if (order.shipment?.awb) {
            return response(false, 409, "Shipment already exists for this order.", withDefaultShipment(order))
        }

        const address = fullAddress(order)
        if (!address || !order.name || !order.phone || !order.pincode) {
            return response(false, 400, "Order is missing customer name, phone, pincode, or address.")
        }

        const remainingAmount = Number(order.remainingAmount || 0)
        const isCodShipment = order.paymentMethod === "cod" || remainingAmount > 0
        const codAmount = isCodShipment
            ? Number((remainingAmount > 0 ? remainingAmount : order.totalAmount || 0).toFixed(2))
            : 0

        const products = Array.isArray(order.products) ? order.products : []
        const quantity = products.reduce((sum: number, item: any) => sum + Number(item.qty || 0), 0) || 1
        const productDescription = products.map((item: any) => item.name).filter(Boolean).join(" | ") || `Order ${order.order_id}`

        const shipmentPayload = {
            shipments: [{
                name: cleanDelhiveryText(order.name),
                add: cleanDelhiveryText(address),
                pin: cleanDelhiveryText(order.pincode),
                city: cleanDelhiveryText(order.city),
                state: cleanDelhiveryText(order.state),
                country: cleanDelhiveryText(order.country || "India"),
                phone: cleanDelhiveryText(order.phone),
                order: cleanDelhiveryText(order.order_id),
                payment_mode: isCodShipment ? "COD" : "Pre-paid",
                cod_amount: codAmount,
                total_amount: Number(order.totalAmount || 0),
                products_desc: cleanDelhiveryText(productDescription),
                seller_name: "MomStitched",
                seller_add: cleanDelhiveryText(process.env.DELHIVERY_SELLER_ADD),
                quantity,
                shipment_length: parsed.data.length,
                shipment_width: parsed.data.breadth,
                shipment_height: parsed.data.height,
                weight: parsed.data.weight,
                ...(process.env.DELHIVERY_SELLER_GST_TIN
                    ? { seller_gst_tin: cleanDelhiveryText(process.env.DELHIVERY_SELLER_GST_TIN) }
                    : {}),
                ...(process.env.DELHIVERY_HSN_CODE
                    ? { hsn_code: cleanDelhiveryText(process.env.DELHIVERY_HSN_CODE) }
                    : {}),
            }],
            pickup_location: {
                name: cleanDelhiveryText(pickupLocation),
            },
        }

        const baseUrl = (process.env.DELHIVERY_API_BASE_URL || "https://track.delhivery.com").replace(/\/$/, "")
        const body = new URLSearchParams({
            format: "json",
            data: JSON.stringify(shipmentPayload),
        })

        console.log("[Delhivery Create Shipment] DELHIVERY_PICKUP_LOCATION:", process.env.DELHIVERY_PICKUP_LOCATION)
        console.log("[Delhivery Create Shipment] DELHIVERY_API_BASE_URL:", process.env.DELHIVERY_API_BASE_URL)
        console.log("[Delhivery Create Shipment] DELHIVERY_CLIENT_NAME:", process.env.DELHIVERY_CLIENT_NAME)
        console.log("[Delhivery Create Shipment] Final payload before sending:", JSON.stringify(shipmentPayload, null, 2))
        console.log("[Delhivery Create Shipment] Raw request body:", body.toString())

        const delhiveryResponse = await fetch(`${baseUrl}/api/cmu/create.json`, {
            method: "POST",
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body,
        })

        const delhiveryRawResponse = await delhiveryResponse.text()
        console.log("[Delhivery Create Shipment] Raw response body:", delhiveryRawResponse)

        const delhiveryData = (() => {
            try {
                return JSON.parse(delhiveryRawResponse)
            } catch {
                return {}
            }
        })() as DelhiveryCreateOrderResponse
        console.log("[Delhivery Create Shipment] Response body:", JSON.stringify(delhiveryData, null, 2))

        const awb = extractAwb(delhiveryData)

        if (!delhiveryResponse.ok || !awb) {
            return response(false, 502, extractDelhiveryError(delhiveryData), { delhivery: delhiveryData })
        }

        const now = new Date()
        order.shipment = {
            ...(order.shipment?.toObject?.() || order.shipment || {}),
            courier: "Delhivery",
            awb,
            shipmentStatus: "READY_TO_SHIP",
            trackingUrl: `https://www.delhivery.com/track/package/${awb}`,
            pickupLocation,
            length: parsed.data.length,
            breadth: parsed.data.breadth,
            height: parsed.data.height,
            weight: parsed.data.weight,
            shippingMode: isCodShipment ? "COD" : "PREPAID",
            shipmentCreatedAt: now,
            lastSyncedAt: now,
        }

        await order.save()

        const updatedOrder = await Order.findById(order._id)
            .populate("products.productId", "name slug")
            .populate({
                path: "products.variantId",
                populate: { path: "media" },
            })
            .lean()

        return response(true, 200, "Shipment created successfully.", withDefaultShipment(updatedOrder))
    } catch (error) {
        return catchError(error)
    }
}
