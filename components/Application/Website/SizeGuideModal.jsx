'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import SizeGuideTable from "@/components/Application/Website/SizeGuideTable"

const SizeGuideModal = ({ open, onOpenChange, sizeGuide }) => {
    const isMobile = useIsMobile()
    const isLoading = sizeGuide === undefined

    const content = (
        <div className="space-y-4">
                <div className="rounded-md border border-border/60 bg-white">
                {isLoading ? (
                    <div className="rounded-md border border-dashed border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                        Loading size guide...
                    </div>
                ) : (
                    <SizeGuideTable columns={sizeGuide?.columns} rows={sizeGuide?.rows} />
                )}
            </div>
            <div className="rounded-md bg-muted/40 p-3">
                <p className="text-sm font-medium">Note</p>
                <p className="text-sm text-muted-foreground">
                    {sizeGuide?.note ? sizeGuide.note : "Measurements may vary slightly."}
                </p>
            </div>
        </div>
    )

    if (isMobile) {
        return (
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent side="bottom" className="rounded-t-2xl border-border/60 bg-white p-0">
                    <SheetHeader className="border-b border-border/60 px-5 py-4">
                        <SheetTitle className="text-lg font-semibold uppercase tracking-[0.08em]">Size Guide</SheetTitle>
                        <SheetDescription className="text-sm text-muted-foreground">
                            Find your best fit.
                        </SheetDescription>
                    </SheetHeader>
                        <div className="px-5 py-4">
                        {content}
                    </div>
                </SheetContent>
            </Sheet>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="w-[min(92vw,980px)] max-w-5xl rounded-2xl border-border/60 bg-white p-0">
                <DialogHeader className="border-b border-border/60 px-6 py-4">
                    <DialogTitle className="text-lg font-semibold uppercase tracking-[0.08em]">Size Guide</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Find your best fit.
                    </DialogDescription>
                </DialogHeader>
                    <div className="px-6 py-5">
                    {content}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default SizeGuideModal
