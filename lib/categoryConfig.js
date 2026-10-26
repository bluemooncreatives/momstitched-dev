import { z } from 'zod'
import { zSchema } from '@/lib/zodSchema'

// Shared by the admin category form (client) and the category API (server).

// Which part of the cover stays visible when a tile crops it.
export const COVER_POSITIONS = ['center', 'top', 'bottom', 'left', 'right']
export const MAX_COVER_ALT = 200
export const MAX_CATEGORY_INTRO = 2000
export const MAX_CATEGORY_FAQS = 10

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid image.')

export const categoryFaqSchema = z.object({
    q: z.string().trim().min(5, 'Question is too short.').max(200, 'Question must be at most 200 characters.'),
    a: z.string().trim().min(5, 'Answer is too short.').max(1000, 'Answer must be at most 1000 characters.'),
})

export const categorySchema = zSchema.pick({ name: true, slug: true }).extend({
    coverImage: objectId.nullable().optional(),
    coverAlt: z.string().trim().max(MAX_COVER_ALT, `Alt text must be at most ${MAX_COVER_ALT} characters.`).optional().default(''),
    coverPosition: z.enum(COVER_POSITIONS).optional().default('center'),
    intro: z.string().trim().max(MAX_CATEGORY_INTRO, `Intro must be at most ${MAX_CATEGORY_INTRO} characters.`).optional().default(''),
    faqs: z.array(categoryFaqSchema).max(MAX_CATEGORY_FAQS, `Add at most ${MAX_CATEGORY_FAQS} questions.`).optional().default([]),
})

export const categoryUpdateSchema = categorySchema.extend({ _id: zSchema.shape._id })

// Tailwind classes for each crop focus (object-position on the cover image).
export const COVER_POSITION_CLASS = {
    center: 'object-center',
    top: 'object-top',
    bottom: 'object-bottom',
    left: 'object-left',
    right: 'object-right',
}

/**
 * The storefront cover for a category with a populated `coverImage`, or null
 * when there is none or its media is trashed — callers then fall back to a
 * product photo. The reference itself is kept, so restoring the media
 * restores the cover.
 */
export const categoryCover = (category) => {
    const media = category?.coverImage
    if (!media || typeof media !== 'object' || media.deletedAt || media.deletingAt || !media.secure_url) return null
    return {
        src: media.secure_url,
        alt: category.coverAlt || media.alt || category.name || '',
        position: COVER_POSITIONS.includes(category.coverPosition) ? category.coverPosition : 'center',
    }
}
