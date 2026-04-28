'use client'
import { memo, useEffect, useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import ButtonLoading from '../ButtonLoading'
import { useRouter, useSearchParams } from 'next/navigation'
import { WEBSITE_SHOP } from '@/routes/WebsiteRoute'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Minus, Plus } from 'lucide-react'
const Filter = ({ filters }) => {
    const searchParams = useSearchParams()

    const [priceFilter, setPriceFilter] = useState({ minPrice: 0, maxPrice: 3000 })
    const [selectedCategory, setSelectedCategory] = useState([])
    const [selectedColor, setSelectedColor] = useState([])
    const [selectedSize, setSelectedSize] = useState([])

    const categories = filters?.categories ?? null
    const colors = filters?.colors ?? null
    const sizes = filters?.sizes ?? null

    const categoriesReady = Array.isArray(categories)
    const colorsReady = Array.isArray(colors)
    const sizesReady = Array.isArray(sizes)

    const urlSearchParams = new URLSearchParams(searchParams.toString())
    const router = useRouter()

    useEffect(() => {
        searchParams.get('category') ? setSelectedCategory(searchParams.get('category').split(',')) : setSelectedCategory([])

        searchParams.get('color') ? setSelectedColor(searchParams.get('color').split(',')) : setSelectedColor([])

        searchParams.get('size') ? setSelectedSize(searchParams.get('size').split(',')) : setSelectedSize([])

        const minPrice = parseInt(searchParams.get('minPrice'))
        const maxPrice = parseInt(searchParams.get('maxPrice'))
        const normalizedMin = Number.isFinite(minPrice) ? Math.max(0, Math.min(minPrice, 3000)) : 0
        const normalizedMax = Number.isFinite(maxPrice) ? Math.max(normalizedMin, Math.min(maxPrice, 3000)) : 3000

        setPriceFilter({
            minPrice: normalizedMin,
            maxPrice: normalizedMax,
        })

    }, [searchParams])



    const handlePriceChange = (value) => {
        setPriceFilter({ minPrice: value[0], maxPrice: value[1] })
    }



    const handleCategoryFilter = (categorySlug) => {
        let newSelectedCategory = [...selectedCategory]
        if (newSelectedCategory.includes(categorySlug)) {
            newSelectedCategory = newSelectedCategory.filter(cat => cat !== categorySlug)
        } else {
            newSelectedCategory.push(categorySlug)
        }

        setSelectedCategory(newSelectedCategory)

        newSelectedCategory.length > 0 ? urlSearchParams.set('category', newSelectedCategory.join(',')) : urlSearchParams.delete('category')

        router.push(`${WEBSITE_SHOP}?${urlSearchParams}`)

    }

    const handleColorFilter = (color) => {
        let newSelectedColor = [...selectedColor]
        if (newSelectedColor.includes(color)) {
            newSelectedColor = newSelectedColor.filter(cat => cat !== color)
        } else {
            newSelectedColor.push(color)
        }

        setSelectedColor(newSelectedColor)

        newSelectedColor.length > 0 ? urlSearchParams.set('color', newSelectedColor.join(',')) : urlSearchParams.delete('color')

        router.push(`${WEBSITE_SHOP}?${urlSearchParams}`)

    }

    const handleSizeFilter = (size) => {
        let newSelectedSize = [...selectedSize]
        if (newSelectedSize.includes(size)) {
            newSelectedSize = newSelectedSize.filter(cat => cat !== size)
        } else {
            newSelectedSize.push(size)
        }

        setSelectedSize(newSelectedSize)

        newSelectedSize.length > 0 ? urlSearchParams.set('size', newSelectedSize.join(',')) : urlSearchParams.delete('size')

        router.push(`${WEBSITE_SHOP}?${urlSearchParams}`)

    }

    const handlePriceFilter = () => {
        urlSearchParams.set('minPrice', priceFilter.minPrice)
        urlSearchParams.set('maxPrice', priceFilter.maxPrice)
        router.push(`${WEBSITE_SHOP}?${urlSearchParams}`)
    }

    const hasFilters = searchParams.size > 0


    return (
        <div className="space-y-6 text-sm font-neue">
            {hasFilters && (
                <Button type="button" variant="link" className="h-auto w-fit p-0 text-[11px] font-semibold uppercase tracking-[0.24em] text-foreground" asChild>
                    <Link href={WEBSITE_SHOP}>
                        Clear Filters
                    </Link>
                </Button>
            )}

            <Accordion
                type="multiple"
                defaultValue={['category', 'color', 'size', 'price']}
                className="space-y-4"
            >
                <AccordionItem value="category" className="border-b border-border/60">
                    <AccordionTrigger className="group flex w-full items-center justify-between py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-foreground hover:no-underline [&_[data-slot=accordion-trigger-icon]]:hidden">
                        <span>Categories</span>
                        <span className="relative flex size-4 items-center justify-center">
                            <Plus className="absolute size-4 transition-all duration-200 group-data-[state=open]:rotate-90 group-data-[state=open]:opacity-0" />
                            <Minus className="absolute size-4 opacity-0 transition-all duration-200 group-data-[state=open]:opacity-100" />
                        </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                        <ul className="space-y-2.5">
                            {!categoriesReady && (
                                <li className="px-2 py-1.5 text-[12px] text-muted-foreground">Loading categories...</li>
                            )}
                            {categoriesReady && categories.length === 0 && (
                                <li className="px-2 py-1.5 text-[12px] text-muted-foreground">No categories available.</li>
                            )}
                            {categoriesReady && categories.map((category) => {
                                const categoryId = `category-${category._id}`
                                const active = selectedCategory.includes(category.slug)
                                return (
                                    <li key={category._id}>
                                        <label
                                            htmlFor={categoryId}
                                            className={`flex cursor-pointer items-center gap-3 px-1 py-1.5 text-[13px] transition ${active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                        >
                                            <Checkbox
                                                id={categoryId}
                                                onCheckedChange={() => handleCategoryFilter(category.slug)}
                                                checked={selectedCategory.includes(category.slug)}
                                            />
                                            <span>{category.name}</span>
                                        </label>
                                    </li>
                                )
                            })}
                        </ul>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="color" className="border-b border-border/60">
                    <AccordionTrigger className="group flex w-full items-center justify-between py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-foreground hover:no-underline [&_[data-slot=accordion-trigger-icon]]:hidden">
                        <span>Color</span>
                        <span className="relative flex size-4 items-center justify-center">
                            <Plus className="absolute size-4 transition-all duration-200 group-data-[state=open]:rotate-90 group-data-[state=open]:opacity-0" />
                            <Minus className="absolute size-4 opacity-0 transition-all duration-200 group-data-[state=open]:opacity-100" />
                        </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                        <ul className="space-y-2.5">
                            {!colorsReady && (
                                <li className="px-2 py-1.5 text-[12px] text-muted-foreground">Loading colors...</li>
                            )}
                            {colorsReady && colors.length === 0 && (
                                <li className="px-2 py-1.5 text-[12px] text-muted-foreground">No colors available.</li>
                            )}
                            {colorsReady && colors.map((color) => {
                                const safeColor = String(color).replace(/\s+/g, '-').toLowerCase()
                                const colorId = `color-${safeColor}`
                                const active = selectedColor.includes(color)
                                return (
                                    <li key={color}>
                                        <label
                                            htmlFor={colorId}
                                            className={`flex cursor-pointer items-center gap-3 px-1 py-1.5 text-[13px] transition ${active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                        >
                                            <Checkbox
                                                id={colorId}
                                                onCheckedChange={() => handleColorFilter(color)}
                                                checked={selectedColor.includes(color)}
                                            />
                                            <span
                                                className="h-3.5 w-3.5 rounded-full border border-black/20"
                                                style={{ backgroundColor: color }}
                                                aria-hidden
                                            />
                                            <span>{color}</span>
                                        </label>
                                    </li>
                                )
                            })}
                        </ul>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="size" className="border-b border-border/60">
                    <AccordionTrigger className="group flex w-full items-center justify-between py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-foreground hover:no-underline [&_[data-slot=accordion-trigger-icon]]:hidden">
                        <span>Size</span>
                        <span className="relative flex size-4 items-center justify-center">
                            <Plus className="absolute size-4 transition-all duration-200 group-data-[state=open]:rotate-90 group-data-[state=open]:opacity-0" />
                            <Minus className="absolute size-4 opacity-0 transition-all duration-200 group-data-[state=open]:opacity-100" />
                        </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                        <ul className="grid grid-cols-2 gap-2">
                            {!sizesReady && (
                                <li className="col-span-2 px-2 py-1.5 text-[12px] text-muted-foreground">Loading sizes...</li>
                            )}
                            {sizesReady && sizes.length === 0 && (
                                <li className="col-span-2 px-2 py-1.5 text-[12px] text-muted-foreground">No sizes available.</li>
                            )}
                            {sizesReady && sizes.map((size) => {
                                const safeSize = String(size).replace(/\s+/g, '-').toLowerCase()
                                const sizeId = `size-${safeSize}`
                                const active = selectedSize.includes(size)
                                return (
                                    <li key={size}>
                                        <label
                                            htmlFor={sizeId}
                                            className={`flex cursor-pointer items-center gap-2 px-1 py-1.5 text-[13px] transition ${active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                        >
                                            <Checkbox
                                                id={sizeId}
                                                onCheckedChange={() => handleSizeFilter(size)}
                                                checked={selectedSize.includes(size)}
                                            />
                                            <span>{size}</span>
                                        </label>
                                    </li>
                                )
                            })}
                        </ul>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="price" className="border-b border-border/60">
                    <AccordionTrigger className="group flex w-full items-center justify-between py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-foreground hover:no-underline [&_[data-slot=accordion-trigger-icon]]:hidden">
                        <span>Price</span>
                        <span className="relative flex size-4 items-center justify-center">
                            <Plus className="absolute size-4 transition-all duration-200 group-data-[state=open]:rotate-90 group-data-[state=open]:opacity-0" />
                            <Minus className="absolute size-4 opacity-0 transition-all duration-200 group-data-[state=open]:opacity-100" />
                        </span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pb-4">
                        <Slider
                            className="mt-1"
                            value={[priceFilter.minPrice, priceFilter.maxPrice]}
                            max={3000}
                            step={1}
                            onValueChange={handlePriceChange}
                        />
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                            <div className="border border-border/60 px-2 py-2 text-center">
                                {priceFilter.minPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                            </div>
                            <div className="border border-border/60 px-2 py-2 text-center">
                                {priceFilter.maxPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                            </div>
                        </div>
                        <ButtonLoading onClick={handlePriceFilter} type="button" text="Apply Price" variant="brand" className="h-9 w-full rounded-none text-[11px] font-semibold uppercase tracking-[0.2em]" />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}

export default memo(Filter)
