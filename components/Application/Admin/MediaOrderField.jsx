'use client'
import Image from 'next/image'
import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    closestCenter,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import {
    SortableContext,
    arrayMove,
    rectSortingStrategy,
    sortableKeyboardCoordinates,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, ImagePlus, Star, TriangleAlert, X } from 'lucide-react'
import { MAX_PRODUCT_MEDIA } from '@/lib/productMedia'

// Admin form state for one image. `unavailable` = trashed or being deleted.
export const toMediaItem = (media) => ({
    _id: String(media._id),
    url: media.secure_url || media.url,
    alt: media.alt || '',
    unavailable: Boolean(media.deletedAt || media.deletingAt || media.unavailable),
})

export const unavailableCount = (items) => items.filter((item) => item.unavailable).length

const SortableTile = ({ item, index, onRemove, onMakeMain }) => {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: item._id })
    const isMain = index === 0

    return (
        <li
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            className={`group relative aspect-square overflow-hidden rounded-md border bg-muted ${isDragging ? 'z-10 opacity-80 shadow-lg ring-2 ring-primary' : ''} ${item.unavailable ? 'border-destructive ring-1 ring-destructive' : ''}`}
        >
            <Image src={item.url} alt={item.alt || ''} fill sizes="128px" className={`object-cover ${item.unavailable ? 'opacity-40 grayscale' : ''}`} />

            <button
                type="button"
                ref={setActivatorNodeRef}
                {...attributes}
                {...listeners}
                aria-label={`Reorder image ${index + 1}${isMain ? ' (main image)' : ''}. Press space to pick up, arrow keys to move.`}
                className="absolute left-1 top-1 flex size-7 cursor-grab touch-none items-center justify-center rounded bg-background/90 text-foreground shadow-sm active:cursor-grabbing"
            >
                <GripVertical className="size-4" />
            </button>

            <button
                type="button"
                onClick={() => onRemove(item._id)}
                aria-label={`Remove image ${index + 1}`}
                className="absolute right-1 top-1 flex size-7 items-center justify-center rounded bg-background/90 text-foreground shadow-sm hover:bg-destructive hover:text-white"
            >
                <X className="size-4" />
            </button>

            {item.unavailable ? (
                <span className="absolute inset-x-1 bottom-1 flex items-center gap-1 rounded bg-destructive px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    <TriangleAlert className="size-3" /> In trash — remove
                </span>
            ) : isMain ? (
                <span className="absolute inset-x-1 bottom-1 flex items-center justify-center gap-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary-foreground">
                    <Star className="size-3" /> Main image
                </span>
            ) : (
                <button
                    type="button"
                    onClick={() => onMakeMain(item._id)}
                    className="absolute inset-x-1 bottom-1 rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-semibold text-foreground opacity-100 shadow-sm sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                >
                    Make main
                </button>
            )}
        </li>
    )
}

/**
 * Ordered image list for products/variants. Order is what gets saved: the
 * first image is the main one. Drag with mouse, press-and-hold on touch, or
 * focus a handle and use space + arrow keys.
 */
const MediaOrderField = ({ items, onChange, onAdd, max = MAX_PRODUCT_MEDIA }) => {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const handleDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return
        const from = items.findIndex((item) => item._id === active.id)
        const to = items.findIndex((item) => item._id === over.id)
        if (from < 0 || to < 0) return
        onChange(arrayMove(items, from, to))
    }

    const remove = (id) => onChange(items.filter((item) => item._id !== id))
    const makeMain = (id) => {
        const item = items.find((entry) => entry._id === id)
        if (item) onChange([item, ...items.filter((entry) => entry._id !== id)])
    }

    const trashed = unavailableCount(items)

    return (
        <div className="flex flex-col gap-3 text-left">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <p className="text-sm font-medium">
                        Images <span className="text-red-500">*</span>
                        <span className="ml-2 text-xs font-normal text-muted-foreground">{items.length} / {max}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">Drag to reorder. The first image is the main image shown on cards and previews.</p>
                </div>
                <button
                    type="button"
                    onClick={onAdd}
                    disabled={items.length >= max}
                    className="inline-flex h-9 items-center gap-2 rounded-md border bg-background px-3 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <ImagePlus className="size-4" />
                    {items.length ? 'Add / change images' : 'Select images'}
                </button>
            </div>

            {trashed > 0 && (
                <p role="alert" className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    <TriangleAlert className="size-4 shrink-0" />
                    {trashed === 1 ? 'One image is' : `${trashed} images are`} in the media trash. Remove {trashed === 1 ? 'it' : 'them'} (or restore from Media) before saving.
                </p>
            )}

            {items.length > 0 ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={items.map((item) => item._id)} strategy={rectSortingStrategy}>
                        <ol className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-8">
                            {items.map((item, index) => (
                                <SortableTile key={item._id} item={item} index={index} onRemove={remove} onMakeMain={makeMain} />
                            ))}
                        </ol>
                    </SortableContext>
                </DndContext>
            ) : (
                <button
                    type="button"
                    onClick={onAdd}
                    className="flex h-28 w-full items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground hover:bg-muted"
                >
                    No images yet — select from the media library
                </button>
            )}
        </div>
    )
}

export default MediaOrderField
