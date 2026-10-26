// Single source of truth for the storefront's public identity and the
// schema.org JSON-LD builders rendered by <JsonLd />. Every URL emitted here is
// absolute — crawlers resolve JSON-LD without the page's metadataBase.

import { WEBSITE_CATEGORY, WEBSITE_SHOP, productHref } from '@/routes/WebsiteRoute'
import { htmlToText } from '@/lib/utils'

export const SITE_URL = 'https://www.momstitched.com'
export const SITE_NAME = 'MomStitched'
export const SITE_LOGO = `${SITE_URL}/assets/images/logo-maroon.png`
export const CONTACT_EMAIL = 'momstitched.official@gmail.com'
export const CURRENCY = 'INR'

export const SOCIAL_PROFILES = {
    instagram: 'https://www.instagram.com/mom.stitched',
    facebook: 'https://www.facebook.com/profile.php?id=100087738263074',
    twitter: 'https://twitter.com/momstitched',
}

export const absoluteUrl = (path = '/') =>
    /^https?:\/\//i.test(path) ? path : `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`

// Category landing page — the canonical home of a category (/shop?category=x
// canonicalises here).
export const categoryUrl = (slug) => absoluteUrl(WEBSITE_CATEGORY(slug))

const ORGANIZATION_ID = `${SITE_URL}/#organization`
const WEBSITE_ID = `${SITE_URL}/#website`

export const organizationJsonLd = () => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: SITE_LOGO,
    email: CONTACT_EMAIL,
    sameAs: Object.values(SOCIAL_PROFILES),
    contactPoint: [
        {
            '@type': 'ContactPoint',
            contactType: 'customer support',
            email: CONTACT_EMAIL,
            url: absoluteUrl('/contact'),
            areaServed: 'IN',
        },
    ],
})

// Sitelinks search box: the shop page already filters on `?q=`, which is the
// same URL GlobalSearch navigates to.
export const websiteJsonLd = () => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { '@id': ORGANIZATION_ID },
    inLanguage: 'en-IN',
    potentialAction: {
        '@type': 'SearchAction',
        target: {
            '@type': 'EntryPoint',
            urlTemplate: `${absoluteUrl(WEBSITE_SHOP)}?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
    },
})

// `items` is [{ name, path }]; the last crumb is the current page.
export const breadcrumbJsonLd = (items) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: absoluteUrl(item.path),
    })),
})

export const faqJsonLd = (faqs) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
})

// The offer mirrors the variant the page renders for its canonical URL, so the
// marked-up price always matches the visible price (Google requires that).
export const productJsonLd = ({ product, variant, reviewCount, ratingAvg }) => {
    const url = absoluteUrl(productHref(product))
    const images = [...(variant?.media || []), ...(product.media || [])]
        .map((media) => media?.secure_url)
        .filter(Boolean)
    const price = variant?.sellingPrice ?? product.sellingPrice
    const mrp = variant?.mrp ?? product.mrp

    const offer = {
        '@type': 'Offer',
        url,
        priceCurrency: CURRENCY,
        price,
        // Every piece is made-to-order, so a live variant is always purchasable.
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
        // Inlined: the Organization node only renders on the homepage, so an
        // @id reference would dangle here.
        seller: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    }
    if (variant?.sku) offer.sku = variant.sku
    if (mrp > price) {
        offer.priceSpecification = [
            { '@type': 'UnitPriceSpecification', price, priceCurrency: CURRENCY },
            {
                '@type': 'UnitPriceSpecification',
                priceType: 'https://schema.org/StrikethroughPrice',
                price: mrp,
                priceCurrency: CURRENCY,
            },
        ]
    }

    const data = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        '@id': `${url}#product`,
        name: product.name,
        description: htmlToText(product.description).slice(0, 5000),
        url,
        image: [...new Set(images)],
        sku: product.parentSku,
        brand: { '@type': 'Brand', name: SITE_NAME },
        offers: offer,
    }
    if (product.category?.name) data.category = product.category.name
    if (variant?.color) data.color = variant.color
    if (reviewCount > 0 && ratingAvg > 0) {
        data.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: ratingAvg,
            reviewCount,
            bestRating: 5,
            worstRating: 1,
        }
    }
    return data
}
