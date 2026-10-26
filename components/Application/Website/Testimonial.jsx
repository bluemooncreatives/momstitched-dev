import dynamic from 'next/dynamic'
import { getTestimonials } from '@/lib/services/testimonialService'

const TestimonialClient = dynamic(() => import('./TestimonialClient'))

// Starter set shown only until the admin creates their first testimonial, so
// a fresh store's homepage "What They Say" section isn't an empty gap. Once
// any testimonial exists (live or draft) these are never shown again — if the
// admin unpublishes everything, the section is hidden instead.
const DEFAULT_TESTIMONIALS = [
    { name: 'Sophia Patel', review: "This product exceeded my expectations. The quality is top-notch and it arrived much faster than I anticipated. I will definitely be recommending it to my friends and family.", rating: 5 },
    { name: 'James Thompson', review: "Customer service was extremely helpful and responsive. They guided me through every step of the process. I'm very satisfied with the support I received.", rating: 4 },
    { name: 'Emily Chen', review: "I've been using this service for over a month now and it's been amazing. The user interface is intuitive and everything runs smoothly. I haven't faced any major issues so far.", rating: 5 },
    { name: 'Liam Rodriguez', review: "Honestly, I was skeptical at first, but it turned out great. The features offered are well worth the price. There is room for improvement, but overall I'm happy with it.", rating: 4 },
    { name: 'Ava Johnson', review: 'The attention to detail is impressive. From packaging to performance, everything was handled professionally. I feel like I got great value for my money.', rating: 5 },
    { name: 'Noah Davis', review: "There were a few hiccups during setup, but the documentation helped a lot. Once everything was in place, it worked flawlessly. I'm a satisfied customer now.", rating: 4 },
    { name: 'Isabella Martinez', review: 'What stood out the most was how easy it was to get started. The onboarding process is smooth and well thought out. I appreciated the thoughtful design.', rating: 5 },
    { name: 'William Lee', review: "It does what it promises, no complaints there. The pricing is fair and the customer experience is excellent. I'll be coming back for future purchases.", rating: 4 },
    { name: 'Mia Anderson', review: 'I encountered a few bugs in the beginning, but support helped fix them quickly. Now everything works perfectly. The team really listens to feedback.', rating: 4 },
    { name: 'Ethan Clark', review: 'This has been one of the best investments I\'ve made recently. The performance is consistent and it integrates seamlessly with my workflow. Highly recommended!', rating: 5 },
]

const Testimonial = async () => {
    let testimonials = []
    let hasAny = false
    try {
        ({ testimonials, hasAny } = await getTestimonials())
    } catch {
        // A transient DB error must not take down the homepage — hide the section.
        return null
    }

    if (testimonials?.length > 0) {
        return <TestimonialClient testimonials={testimonials} />
    }

    // Every testimonial is a draft: respect that rather than showing samples.
    if (hasAny) return null

    return <TestimonialClient testimonials={DEFAULT_TESTIMONIALS} />
}

export default Testimonial
