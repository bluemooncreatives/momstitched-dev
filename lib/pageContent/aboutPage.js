import { EMPTY_IMAGE, image, mergeContent } from './shared.js'

/* ================================================================
   ABOUT US PAGE — designed defaults
   Everything here is what /about-us shows until an admin publishes
   their own copy from Admin → Pages → About Us. Reads always merge the
   stored document over these defaults, so new fields have a value.
   ================================================================ */

export const ABOUT_PAGE_KEY = 'about-us'

export const ABOUT_PAGE_LIMITS = {
    people: 6,
}

const STORY = [
    "MomStitched was born in May 2021, in the heart of India's hardest COVID days. What started as one small idea, carried through so much uncertainty, slowly grew into something far greater - a quiet symbol of hope. And it began with my mom: her creativity, her strength, and her endless love became the spirit behind every thread we stitch, and the reason this journey ever started.",
    "What makes us different is simple - we're not backed by big corporations, we're powered by family. My sister keeps everything running seamlessly online, my father handles logistics like a pro, and together, by hand, we build every part of this brand. Every design, every package, every decision travels straight from our home to yours.",
    'Rooted in India and driven by passion, we make clothing that feels real, personal, and meaningful - because it truly is. This isn\'t fast fashion. It\'s family fashion. This is MomStitched.',
]

export const DEFAULT_ABOUT_PAGE = {
    hero: {
        headline: 'about us',
        caption: 'Born May 2021 · made by family,\nrooted in India',
        left: image('https://res.cloudinary.com/darrsi9y2/image/upload/v1783146225/DSCF5008_1_r7uftx.jpg', 'MomStitched detail'),
        centre: image('https://res.cloudinary.com/darrsi9y2/image/upload/v1783063101/WhatsApp_Image_2026-07-03_at_12.46.03_PM_uqte4t.jpg', 'MomStitched atelier'),
        right: image('https://res.cloudinary.com/darrsi9y2/image/upload/v1781942605/x98cddrvoz82losytye7.jpg', 'MomStitched detail'),
    },
    story: {
        enabled: true,
        statement: "MomStitched isn't just a clothing brand - it's a story stitched with love, resilience, and family.",
        body: STORY.join('\n\n'),
    },
    feature: {
        enabled: true,
        image: image('https://res.cloudinary.com/darrsi9y2/image/upload/v1781947528/qcbfdwai0pmvv97khlcw.jpg', 'MomStitched craftsmanship'),
    },
    family: {
        enabled: true,
        eyebrow: 'THE FAMILY',
        title: 'Not built by a corporation - built by a family, by hand.',
        intro: 'Behind every MomStitched piece is one small family doing every part themselves - designing, stitching, packing, and shipping straight from our home in India to yours. These are the two women at the very heart of it.',
        people: [
            {
                name: 'Aditi Dhakate',
                role: 'Founder · Face Behind the brand',
                bio: [
                    'I started out in IT engineering - a world of code, systems, and logic. But creativity had other plans for me.',
                    "Taking a leap from tech into fashion wasn't random - it was inspired by the strongest influence in my life: my mom. Her creativity and passion became the soul of MomStitched, and the reason I dared to turn this idea into reality.",
                    "Today I'm the face behind the brand, bringing together creativity, clarity, and a fresh perspective. I still carry my technical mindset - but now I use it to build something more expressive and personal.",
                    "Bubbly, driven, and real - professional when it matters, cool always. For me, fashion is about confidence, identity, and owning your story. And I'm just getting started.",
                ].join('\n\n'),
                photo: image('https://res.cloudinary.com/darrsi9y2/image/upload/v1781945835/einxusjo1pubrtkgfddc.jpg', 'Aditi Dhakate'),
            },
            {
                name: 'Sandhya Dhakate',
                role: 'Mom · Heart of MomStitched',
                bio: [
                    'She is the heart, the strength, and the soul behind MomStitched. A homemaker by role but a creator by passion, she has always expressed her love through every stitch she made for her daughters.',
                    'What began as simple, thoughtful creations at home has grown into something much bigger - today she stitches not just for us, but for daughters everywhere.',
                    'Her strength lies in her warmth, her creativity, and the way she brings life into everything she touches - graceful, vibrant, and endlessly inspiring.',
                    "Beyond the brand she's full of life — kitty parties, picnics, community work, and peace in her bhajan groups. MomStitched exists because of her: her love, her vision, and her magic in every stitch.",
                ].join('\n\n'),
                photo: image('https://res.cloudinary.com/darrsi9y2/image/upload/v1783063101/WhatsApp_Image_2026-07-03_at_12.46.03_PM_uqte4t.jpg', 'Sandhya Dhakate'),
            },
        ],
        ctaLabel: 'Get in touch',
        ctaHref: '/contact',
    },
    related: {
        enabled: true,
        eyebrow: 'Curated For You',
        title: 'You May Also Like',
    },
}

// Shapes for items added to a list, and for merging stored list items.
export const ABOUT_PAGE_TEMPLATES = {
    'family.people': { name: '', role: '', bio: '', photo: EMPTY_IMAGE },
}

export const mergeAboutPage = (stored) => mergeContent(DEFAULT_ABOUT_PAGE, stored, ABOUT_PAGE_TEMPLATES)
