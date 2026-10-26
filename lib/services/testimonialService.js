import { unstable_cache } from 'next/cache'
import { connectDB } from '@/lib/databaseConnection'
import TestimonialModel from '@/models/Testimonial.model'

export const TESTIMONIALS_TAG = 'storefront-testimonials'

const toPlainObject = (data) => JSON.parse(JSON.stringify(data))

// Live entries for the homepage plus whether the admin has ever created one
// (drafts and deleted ones included). The section uses `hasAny` to tell "never
// set up" (show the starter set) apart from "everything unpublished/removed"
// (hide the section).
const fetchTestimonials = async () => {
    await connectDB()

    const [testimonials, total] = await Promise.all([
        TestimonialModel.find({ deletedAt: null, isActive: true })
            .sort({ sortOrder: 1, createdAt: -1, _id: 1 })
            .select('name review rating')
            .lean(),
        TestimonialModel.estimatedDocumentCount(),
    ])

    return toPlainObject({ testimonials, hasAny: total > 0 })
}

// Cached read for the storefront "What They Say" section. Invalidated by the
// admin testimonial routes via revalidateTag(TESTIMONIALS_TAG). The key is
// versioned because the cached value's shape changed.
export const getTestimonials = unstable_cache(
    fetchTestimonials,
    [`${TESTIMONIALS_TAG}-v2`],
    {
        revalidate: 300,
        tags: [TESTIMONIALS_TAG],
    }
)
