import { z } from 'zod'
import { ABOUT_PAGE_KEY, ABOUT_PAGE_LIMITS, DEFAULT_ABOUT_PAGE, mergeAboutPage } from './aboutPage.js'
import { IMAGE_POSITIONS } from './shared.js'

/* ================================================================
   PAGE CONTENT — validation
   One zod schema per page, shared by the admin editor (client) and
   /api/page-content/[key] (server), so the storefront can trust what
   it reads. Limits are generous enough for real copy and tight enough
   that no field can break a layout.
   ================================================================ */

const text = (max, { required = false, label = 'This field' } = {}) => {
    const base = z.string().trim().max(max, `${label} must be at most ${max} characters.`)
    return required ? base.min(1, `${label} is required.`) : base
}

const isStorefrontPath = (value) => /^\/(?!\/)/.test(value) && !/[\\\s]/.test(value)

const isHttpsUrl = (value) => {
    if (!/^https:\/\//.test(value) || /[\\\s]/.test(value)) return false
    try {
        const url = new URL(value)
        return !url.username && !url.password
    } catch {
        return false
    }
}

const isCloudinaryImage = (value) => {
    if (!isHttpsUrl(value)) return false
    const url = new URL(value)
    return url.hostname === 'res.cloudinary.com' && !url.port && !url.search && !url.hash && /\/image\/upload\//.test(url.pathname)
}

const link = (label = 'Link') => z.string().trim().max(300, `${label} is too long.`).refine(
    (v) => isStorefrontPath(v) || isHttpsUrl(v),
    'Use a storefront path like /shop or a full https:// link.'
)

export const imageSchema = z.object({
    mediaId: z.string().trim().max(24).refine((v) => v === '' || /^[a-f0-9]{24}$/i.test(v), 'Pick the image again from the media library.'),
    url: z.string().trim().max(500).refine(
        (v) => v === '' || isCloudinaryImage(v) || (isStorefrontPath(v) && !v.startsWith('/api/')),
        'Pick the image from the media library.'
    ),
    alt: text(160, { label: 'Alt text' }),
    position: z.enum(IMAGE_POSITIONS),
}).superRefine((value, ctx) => {
    if (value.url && !value.alt) {
        ctx.addIssue({ code: 'custom', path: ['alt'], message: 'Describe the photo for screen readers.' })
    }
})

const list = (item, { min = 0, max, label }) =>
    z.array(item)
        .min(min, min === 1 ? `Add at least one ${label}.` : `Add at least ${min} ${label}s.`)
        .max(max, `Use at most ${max} ${label}s.`)

/* ── About us ───────────────────────────────────────────────── */

const A = ABOUT_PAGE_LIMITS

export const aboutPageSchema = z.object({
    hero: z.object({
        headline: text(30, { required: true, label: 'Headline' }),
        caption: text(120, { label: 'Caption' }),
        left: imageSchema,
        centre: imageSchema,
        right: imageSchema,
    }),
    story: z.object({
        enabled: z.boolean(),
        statement: text(200, { required: true, label: 'Statement' }),
        body: text(2400, { label: 'Story' }),
    }),
    feature: z.object({
        enabled: z.boolean(),
        image: imageSchema,
    }),
    family: z.object({
        enabled: z.boolean(),
        eyebrow: text(40, { label: 'Label' }),
        title: text(120, { required: true, label: 'Headline' }),
        intro: text(400, { label: 'Introduction' }),
        people: list(z.object({
            name: text(60, { required: true, label: 'Name' }),
            role: text(80, { label: 'Role' }),
            bio: text(1600, { label: 'Bio' }),
            photo: imageSchema,
        }), { max: A.people, label: 'person' }),
        ctaLabel: text(30, { label: 'Button text' }),
        ctaHref: link('Button link'),
    }),
    related: z.object({
        enabled: z.boolean(),
        eyebrow: text(40, { label: 'Label' }),
        title: text(60, { required: true, label: 'Headline' }),
    }),
})

export const PAGE_CONTENT = {
    [ABOUT_PAGE_KEY]: {
        label: 'About us page',
        path: '/about-us',
        schema: aboutPageSchema,
        defaults: DEFAULT_ABOUT_PAGE,
        merge: mergeAboutPage,
    },
}

export const PAGE_CONTENT_KEYS = Object.keys(PAGE_CONTENT)

// "hero › left › alt: Describe the photo…" for the API's error message.
export const firstIssue = (error) => {
    const issue = error?.issues?.[0]
    return issue ? `${issue.path.join(' › ')}: ${issue.message}` : 'Invalid content.'
}
