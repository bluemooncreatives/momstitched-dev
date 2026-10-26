'use client'
import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
import DatatableWrapper from "@/components/Application/Admin/DatatableWrapper"
import DeleteAction from "@/components/Application/Admin/DeleteAction"
import PageHeader from "@/components/Application/Admin/PageHeader"
import { Button } from "@/components/ui/button"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { DT_REVIEW_COLUMN, } from "@/lib/column"
import { columnConfig } from "@/lib/helperFunction"
import { showToast } from "@/lib/showToast"
import { cn } from "@/lib/utils"
import { ADMIN_DASHBOARD, ADMIN_TRASH } from "@/routes/AdminPanelRoute"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { Eye, EyeOff } from "lucide-react"

import { useCallback, useMemo, useState } from "react"

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: '', label: 'Review' },
]

const QUERY_KEY = 'review-data'

const STATUS_TABS = [
    { value: '', label: 'All', countKey: 'all' },
    { value: 'live', label: 'Live', countKey: 'live' },
    { value: 'draft', label: 'Draft', countKey: 'draft' },
]

const ShowReview = () => {
    const queryClient = useQueryClient()
    const [status, setStatus] = useState('')

    const columns = useMemo(() => {
        return columnConfig(DT_REVIEW_COLUMN)
    }, [])

    const statusMutation = useMutation({
        mutationFn: async ({ ids, isPublished }) => {
            const { data: response } = await axios.put('/api/review/status', { ids, isPublished })
            if (!response.success) {
                throw new Error(response.message)
            }
            return response
        },
        onSuccess: (data) => {
            showToast('success', data.message)
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
        },
        onError: (error) => {
            showToast('error', error.message)
        },
    })
    const setPublished = statusMutation.mutate

    const action = useCallback((row, deleteType, handleDelete) => {
        let actionMenu = []
        const isLive = row.original.isPublished !== false

        actionMenu.push(
            <DropdownMenuItem
                key="status"
                className="cursor-pointer"
                onClick={() => setPublished({ ids: [row.original._id], isPublished: !isLive })}
            >
                {isLive ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                {isLive ? 'Unpublish' : 'Publish'}
            </DropdownMenuItem>
        )
        actionMenu.push(<DeleteAction key="delete" handleDelete={handleDelete} row={row} deleteType={deleteType} />)
        return actionMenu
    }, [setPublished])

    const extraParams = useMemo(() => (status ? { status } : {}), [status])

    const renderToolbar = useCallback(({ selectedIds, clearSelection, meta }) => {
        const counts = meta?.statusCounts
        const bulk = (isPublished) => setPublished(
            { ids: selectedIds, isPublished },
            { onSuccess: clearSelection }
        )

        return (
            <>
                <div role="tablist" aria-label="Filter by status" className="inline-flex h-9 items-center rounded-md border bg-background p-0.5">
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab.label}
                            type="button"
                            role="tab"
                            aria-selected={status === tab.value}
                            onClick={() => setStatus(tab.value)}
                            className={cn(
                                'inline-flex h-full items-center gap-1.5 rounded-sm px-3 text-sm font-medium transition-colors',
                                status === tab.value ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            {tab.label}
                            {counts && (
                                <span className="rounded-full bg-background px-1.5 text-xs tabular-nums text-muted-foreground">
                                    {counts[tab.countKey] ?? 0}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
                <Button
                    variant="outline"
                    size="lg"
                    className="h-9"
                    disabled={!selectedIds.length || statusMutation.isPending}
                    onClick={() => bulk(true)}
                >
                    <Eye className="mr-2 size-4" />
                    Publish
                </Button>
                <Button
                    variant="outline"
                    size="lg"
                    className="h-9"
                    disabled={!selectedIds.length || statusMutation.isPending}
                    onClick={() => bulk(false)}
                >
                    <EyeOff className="mr-2 size-4" />
                    Unpublish
                </Button>
            </>
        )
    }, [setPublished, status, statusMutation.isPending])

    return (
        <div className="flex flex-col gap-4 sm:gap-6">
            <PageHeader
                title="Reviews"
                description="Publish or unpublish customer reviews. Drafts stay here and never count towards storefront ratings."
                breadcrumb={<BreadCrumb breadcrumbData={breadcrumbData} />}
            />

            <div className="rounded-md bg-card">
                <DatatableWrapper
                    queryKey={QUERY_KEY}
                    fetchUrl="/api/review"
                    initialPageSize={10}
                    columnsConfig={columns}
                    exportEndpoint="/api/review/export"
                    deleteEndpoint="/api/review/delete"
                    deleteType="SD"
                    trashView={`${ADMIN_TRASH}?trashof=review`}
                    createAction={action}
                    extraParams={extraParams}
                    renderToolbar={renderToolbar}
                />
            </div>
        </div>
    )
}

export default ShowReview
