import { memo } from 'react'
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

const Sorting = ({ sorting, setSorting, mobileFilterOpen, setMobileFilterOpen, resultCount }) => {
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
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
                <Select value={sorting} onValueChange={(value) => setSorting(value)}>
                    <SelectTrigger aria-label="Sort products" className="h-9 w-full rounded-md border-border/70 bg-background text-base font-semibold text-[var(--brand-primary)] md:w-[230px]">
                        <SelectValue placeholder="Default Sorting" />
                    </SelectTrigger>
                    <SelectContent
                        position="popper"
                        className="rounded-md border-border/70 font-neue w-[var(--radix-select-trigger-width)]"
                    >
                        {sortings.map(option => (
                            <SelectItem key={option.value} value={option.value} className="text-base font-semibold text-[var(--brand-primary)]">{option.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {typeof resultCount === 'number' && (
                    <span className="text-base font-semibold text-[var(--brand-primary)]/60">
                        {resultCount > 0 ? `Showing ${resultCount} items` : 'Showing 0 items'}
                    </span>
                )}
            </div>
        </div>
    )
}

export default memo(Sorting)
