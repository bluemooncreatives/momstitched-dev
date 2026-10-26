'use client'
import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import slugify from 'slugify'
import axios from 'axios'
import { Plus, Trash2 } from 'lucide-react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import ButtonLoading from '@/components/Application/ButtonLoading'
import CategoryCoverField from '@/components/Application/Admin/CategoryCoverField'
import { toMediaItem } from '@/components/Application/Admin/MediaOrderField'
import { MAX_CATEGORY_FAQS, MAX_CATEGORY_INTRO, categorySchema, categoryUpdateSchema } from '@/lib/categoryConfig'
import { showToast } from '@/lib/showToast'
import { WEBSITE_CATEGORY } from '@/routes/WebsiteRoute'

const EMPTY = { name: '', slug: '', intro: '', faqs: [] }

/**
 * Add / edit category. `category` is the record from /api/category/get/[id]
 * (edit mode) — its populated coverImage seeds the cover preview.
 */
const CategoryForm = ({ category = null, onSaved }) => {
    const isEdit = Boolean(category?._id)
    const [loading, setLoading] = useState(false)
    const [cover, setCover] = useState(null)
    const [coverAlt, setCoverAlt] = useState('')
    const [coverPosition, setCoverPosition] = useState('center')

    const form = useForm({
        resolver: zodResolver((isEdit ? categoryUpdateSchema : categorySchema).omit({ coverImage: true, coverAlt: true, coverPosition: true })),
        defaultValues: isEdit ? { _id: category._id, ...EMPTY } : EMPTY,
    })
    const faqs = useFieldArray({ control: form.control, name: 'faqs' })

    useEffect(() => {
        if (!category) return
        form.reset({
            _id: category._id,
            name: category.name || '',
            slug: category.slug || '',
            intro: category.intro || '',
            faqs: (category.faqs || []).map(({ q, a }) => ({ q, a })),
        })
        setCover(category.coverImage ? toMediaItem(category.coverImage) : null)
        setCoverAlt(category.coverAlt || '')
        setCoverPosition(category.coverPosition || 'center')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category])

    // Add mode: follow the name until the admin types a slug of their own.
    // Edit mode never rewrites the slug (it used to on every load).
    const name = form.watch('name')
    useEffect(() => {
        if (!isEdit && name && !form.getFieldState('slug').isDirty) {
            form.setValue('slug', slugify(name, { lower: true, strict: true }))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [name, isEdit])

    const handleCoverChange = (next) => {
        setCover(next)
        // A new photo needs its own description and focus.
        if (!next || next._id !== cover?._id) {
            setCoverAlt(next?.alt || '')
            setCoverPosition('center')
        }
    }

    const onSubmit = async (values) => {
        setLoading(true)
        try {
            const payload = {
                ...values,
                coverImage: cover?._id || null,
                coverAlt: cover ? coverAlt.trim() : '',
                coverPosition: cover ? coverPosition : 'center',
            }
            const { data: response } = isEdit
                ? await axios.put('/api/category/update', payload)
                : await axios.post('/api/category/create', payload)
            if (!response.success) {
                throw new Error(response.message)
            }

            showToast('success', response.message)
            if (!isEdit) {
                form.reset(EMPTY)
                setCover(null)
                setCoverAlt('')
                setCoverPosition('center')
            }
            onSaved?.(response)
        } catch (error) {
            showToast('error', error.message)
        } finally {
            setLoading(false)
        }
    }

    const intro = form.watch('intro') || ''
    const slug = form.watch('slug')

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                <div className="grid gap-5 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="Enter category name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Slug <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="Enter slug" {...field} />
                                </FormControl>
                                <p className="text-xs text-muted-foreground">
                                    Page URL: {slug ? WEBSITE_CATEGORY(slug) : '/category/…'}
                                    {isEdit && ' — changing it keeps the old URL redirecting here.'}
                                </p>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="rounded-md border border-dashed p-4 sm:p-5">
                    <CategoryCoverField
                        media={cover}
                        alt={coverAlt}
                        position={coverPosition}
                        categoryName={name}
                        onMediaChange={handleCoverChange}
                        onAltChange={setCoverAlt}
                        onPositionChange={setCoverPosition}
                    />
                </div>

                <div className="flex flex-col gap-4 rounded-md border border-dashed p-4 sm:p-5">
                    <div>
                        <p className="text-sm font-medium">Category page</p>
                        <p className="text-xs text-muted-foreground">Shown on the category&apos;s own page and read by search engines.</p>
                    </div>

                    <FormField
                        control={form.control}
                        name="intro"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Intro text</FormLabel>
                                <FormControl>
                                    <Textarea rows={5} maxLength={MAX_CATEGORY_INTRO} placeholder="A few sentences about this collection — fabrics, occasions, fit. Leave a blank line between paragraphs." {...field} />
                                </FormControl>
                                <p className="text-xs text-muted-foreground">{intro.length}/{MAX_CATEGORY_INTRO} · The first paragraph also becomes the page&apos;s search description.</p>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-medium">FAQs <span className="text-xs font-normal text-muted-foreground">{faqs.fields.length}/{MAX_CATEGORY_FAQS}</span></p>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={faqs.fields.length >= MAX_CATEGORY_FAQS}
                                onClick={() => faqs.append({ q: '', a: '' })}
                            >
                                <Plus className="size-4" />
                                Add question
                            </Button>
                        </div>
                        {faqs.fields.length === 0 && (
                            <p className="text-xs text-muted-foreground">No questions yet. They appear as an accordion on the category page.</p>
                        )}
                        {faqs.fields.map((item, index) => (
                            <div key={item.id} className="grid gap-3 rounded-md border bg-muted/30 p-3 md:grid-cols-[1fr_1.4fr_auto]">
                                <FormField
                                    control={form.control}
                                    name={`faqs.${index}.q`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Question {index + 1}</FormLabel>
                                            <FormControl>
                                                <Input maxLength={200} placeholder="e.g. How do I pick my size?" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`faqs.${index}.a`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Answer</FormLabel>
                                            <FormControl>
                                                <Textarea rows={2} maxLength={1000} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="self-start text-destructive md:mt-6"
                                    aria-label={`Remove question ${index + 1}`}
                                    onClick={() => faqs.remove(index)}
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <ButtonLoading loading={loading} type="submit" text={isEdit ? 'Update Category' : 'Add Category'} className="h-9 cursor-pointer" size="lg" />
                </div>
            </form>
        </Form>
    )
}

export default CategoryForm
