'use client'
import Image from 'next/image'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ImageOff, Library, TriangleAlert, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import MediaModal from '@/components/Application/Admin/MediaModal'
import UploadMedia from '@/components/Application/Admin/UploadMedia'
import { toMediaItem } from '@/components/Application/Admin/MediaOrderField'
import { COVER_POSITIONS, COVER_POSITION_CLASS, MAX_COVER_ALT } from '@/lib/categoryConfig'

const POSITION_LABEL = { center: 'Center', top: 'Top', bottom: 'Bottom', left: 'Left', right: 'Right' }

/**
 * Category cover picker. `media` is a toMediaItem() object or null; alt and
 * position are plain strings. Previews show how the crop focus behaves on the
 * square-ish storefront tile and on the wide landing banner.
 */
const CategoryCoverField = ({ media, alt, position, categoryName, onMediaChange, onAltChange, onPositionChange }) => {
    const queryClient = useQueryClient()
    const [libraryOpen, setLibraryOpen] = useState(false)
    // MediaModal works on an array; mirror the single cover into one.
    const [picked, setPicked] = useState([])

    const openLibrary = () => {
        setPicked(media ? [media] : [])
        setLibraryOpen(true)
    }


    const positionClass = COVER_POSITION_CLASS[position] || COVER_POSITION_CLASS.center

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">Cover image</p>
                <p className="text-xs text-muted-foreground">
                    Shown on the homepage category tile and at the top of the category page. Without one, the newest product photo is used.
                </p>
            </div>

            {media?.unavailable && (
                <p role="alert" className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    <TriangleAlert className="size-4 shrink-0" />
                    This cover is in the media trash, so shoppers see the fallback photo. Restore it from Media or choose another.
                </p>
            )}

            <div className="grid gap-4 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
                <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-muted-foreground">Tile preview</span>
                    <div className="relative aspect-[4/5] overflow-hidden rounded-md border bg-muted">
                        {media ? (
                            <Image src={media.url} alt={alt || ''} fill sizes="220px" className={`object-cover ${positionClass} ${media.unavailable ? 'opacity-40 grayscale' : ''}`} />
                        ) : (
                            <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                                <ImageOff className="size-6" />
                                <span className="text-xs">Automatic (product photo)</span>
                            </div>
                        )}
                        {media && (
                            <span className="absolute inset-x-2 bottom-2 truncate rounded bg-black/55 px-2 py-1 text-center text-xs font-semibold uppercase text-white">
                                {categoryName || 'Category'}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-muted-foreground">Banner preview</span>
                    <div className="relative aspect-[16/6] overflow-hidden rounded-md border bg-muted">
                        {media ? (
                            <Image src={media.url} alt="" fill sizes="(max-width: 768px) 100vw, 600px" className={`object-cover ${positionClass} ${media.unavailable ? 'opacity-40 grayscale' : ''}`} />
                        ) : (
                            <div className="flex size-full items-center justify-center text-xs text-muted-foreground">No custom cover</div>
                        )}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                        <UploadMedia
                            isMultiple={false}
                            queryClient={queryClient}
                            label={media ? 'Upload new cover' : 'Upload cover'}
                            buttonProps={{ variant: 'outline', className: 'h-9' }}
                            onUploaded={(uploaded) => uploaded[0] && onMediaChange(toMediaItem(uploaded[0]))}
                        />
                        <Button type="button" variant="outline" size="lg" className="h-9" onClick={openLibrary}>
                            <Library className="size-4" />
                            Choose from library
                        </Button>
                        {media && (
                            <Button type="button" variant="ghost" size="lg" className="h-9 text-destructive" onClick={() => onMediaChange(null)}>
                                <X className="size-4" />
                                Remove custom cover
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {media && (
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="cover-alt">Alt text</Label>
                        <Input
                            id="cover-alt"
                            value={alt}
                            maxLength={MAX_COVER_ALT}
                            placeholder={`e.g. ${categoryName || 'Kurta sets'} laid out on a wooden table`}
                            onChange={(event) => onAltChange(event.target.value)}
                        />
                        <span className="text-xs text-muted-foreground">Describe the photo for screen readers and search. {alt.length}/{MAX_COVER_ALT}</span>
                    </div>
                    <fieldset className="flex flex-col gap-1.5">
                        <legend className="mb-1.5 text-sm font-medium">Crop focus</legend>
                        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Crop focus">
                            {COVER_POSITIONS.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    role="radio"
                                    aria-checked={position === option}
                                    onClick={() => onPositionChange(option)}
                                    className={`h-8 rounded-md border px-3 text-sm ${position === option ? 'border-primary bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
                                >
                                    {POSITION_LABEL[option]}
                                </button>
                            ))}
                        </div>
                        <span className="text-xs text-muted-foreground">Which part of the photo stays visible when a tile crops it.</span>
                    </fieldset>
                </div>
            )}

            <MediaModal
                open={libraryOpen}
                setOpen={setLibraryOpen}
                selectedMedia={picked}
                setSelectedMedia={setPicked}
                isMultiple={false}
                // Applied only on "Select" — Close / Esc leave the cover as it was.
                onSelect={(selection) => { onMediaChange(toMediaItem(selection[0])) }}
            />
        </div>
    )
}

export default CategoryCoverField
