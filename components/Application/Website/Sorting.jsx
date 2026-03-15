import React, { memo } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { sortings } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { SlidersHorizontal } from 'lucide-react'

const Sorting = ({ limit, setLimit, sorting, setSorting, mobileFilterOpen, setMobileFilterOpen, resultCount }) => {
    return (
        <div className='flex flex-col gap-3 px-4 py-3 font-neue lg:flex-row lg:items-center lg:justify-between'>
            <div className="flex flex-wrap items-center gap-2.5">
                <Button
                    type="button"
                    className="h-9 rounded-md border-border/70 px-3 text-[11px] font-semibold uppercase tracking-[0.2em] lg:hidden"
                    variant="outline"
                    onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                >
                    <SlidersHorizontal className='size-3.5' />
                    Sidebar
                </Button>

                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.23em] text-muted-foreground">
                    <span>Show</span>
                    <div className="flex items-center gap-1.5">
                        {[9, 12, 18, 24].map(limitNumber => (
                            <button
                                key={limitNumber}
                                type='button'
                                onClick={() => setLimit(limitNumber)}
                                className={`inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-1 text-[10px] transition ${limitNumber === limit ? 'border-[var(--dark-red)] bg-[var(--dark-red)] text-white' : 'border-border/70 bg-white text-muted-foreground hover:border-foreground hover:text-foreground'}`}
                            >
                                {limitNumber}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
                <Select value={sorting} onValueChange={(value) => setSorting(value)}>
                    <SelectTrigger className="h-9 w-full rounded-md border-border/70 bg-white text-[12px] uppercase tracking-[0.12em] md:w-[230px]">
                        <SelectValue placeholder="Default Sorting" />
                    </SelectTrigger>
                    <SelectContent className="rounded-md border-border/70">
                        {sortings.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {typeof resultCount === 'number' && (
                    <span className="text-[11px] font-semibold uppercase tracking-[0.23em] text-muted-foreground">
                        {resultCount > 0 ? `Showing 1-${resultCount} items` : 'Showing 0 items'}
                    </span>
                )}
            </div>
        </div>
    )
}

export default memo(Sorting)
