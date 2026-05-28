'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import slugify from "slugify"

const toColumnKey = (label) => {
    const slug = slugify(label || "", { lower: true, strict: true })
    return slug.replace(/-/g, "_")
}

const SizeGuideTable = ({ columns, rows, className = "" }) => {
    const safeColumns = Array.isArray(columns) ? columns : []
    const safeRows = Array.isArray(rows) ? rows : []

    if (!safeColumns.length || !safeRows.length) {
        return (
            <div className={cn("rounded-md border border-dashed border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground", className)}>
                No size guide available yet.
            </div>
        )
    }

    const columnKeys = safeColumns.map((column) => toColumnKey(column))

    return (
        <div className={cn("rounded-md border border-border/60 bg-white shadow-sm", className)}>
            <Table className="w-full table-fixed">
                <TableHeader>
                    <TableRow>
                        {safeColumns.map((column) => (
                            <TableHead
                                key={column}
                                className="whitespace-normal break-words text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
                            >
                                {column}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {safeRows.map((row, rowIndex) => (
                        <TableRow key={`size-guide-row-${rowIndex}`}>
                            {columnKeys.map((key, colIndex) => (
                                <TableCell
                                    key={`size-guide-cell-${rowIndex}-${colIndex}`}
                                    className="whitespace-normal break-words text-sm text-foreground"
                                >
                                    {row?.[key] ?? "-"}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default SizeGuideTable
