import Image from 'next/image'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { SlidersHorizontal } from 'lucide-react'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import WebsiteBreadcrumb from '@/components/Application/Website/WebsiteBreadcrumb'
import ProductBox from '@/components/Application/Website/ProductBox'
import FAQSection from '@/components/Application/Website/FAQSection'
import { BrandButton, BrandOutlineButton } from '@/components/Application/Website/BrandButton'
import JsonLd from '@/components/Application/JsonLd'
import { COVER_POSITION_CLASS } from '@/lib/categoryConfig'
import { getCategoryLanding } from '@/lib/services/categoryLandingService'
import { absoluteUrl, breadcrumbJsonLd, categoryUrl, faqJsonLd, SITE_NAME } from '@/lib/seo'
import { WEBSITE_CATEGORY, WEBSITE_HOME, WEBSITE_SHOP, productHref } from '@/routes/WebsiteRoute'
import { decodeParam, withQuery } from '../../shop/[category]/[slug]/productPage'

const paragraphs = (text) => String(text || '').split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean)

const metaDescription = ({ name, intro }) => {
    const first = paragraphs(intro)[0]
    const text = first || `Shop ${name} at ${SITE_NAME} — handcrafted, made-to-order women's ethnic wear, stitched with care and delivered across India.`
    return text.length > 155 ? `${text.slice(0, 152).replace(/\s+\S*$/, '')}…` : text
}

const shopFilterHref = (slug) => `${WEBSITE_SHOP}?category=${encodeURIComponent(slug)}`

export async function generateMetadata({ params }) {
    const { slug } = await params
    const landing = await getCategoryLanding(decodeParam(slug))
    if (!landing) return { title: 'Category not found' }

    const { category, products, total } = landing
    const description = metaDescription(category)
    const image = category.cover?.src || products[0]?.media?.[0]?.secure_url

    return {
        title: `${category.name} — Shop Online`,
        description,
        alternates: { canonical: WEBSITE_CATEGORY(category.slug) },
        // An empty category is a thin page: keep it out of the index (links on
        // it are still followed) until it has products.
        robots: total > 0 ? undefined : { index: false, follow: true },
        openGraph: {
            title: `${category.name} | ${SITE_NAME}`,
            description,
            url: WEBSITE_CATEGORY(category.slug),
            images: image ? [{ url: image, alt: category.cover?.alt || category.name }] : [],
            type: 'website',
        },
    }
}

const CategoryPage = async ({ params, searchParams }) => {
    const { slug } = await params
    const requested = decodeParam(slug)
    const landing = await getCategoryLanding(requested)
    if (!landing) notFound()

    const { category, products, total, related } = landing

    // Old slug or different casing → the one canonical URL.
    if (requested !== category.slug) {
        permanentRedirect(withQuery(WEBSITE_CATEGORY(category.slug), await searchParams))
    }

    const intro = paragraphs(category.intro)
    const crumbs = [
        { name: 'Home', path: WEBSITE_HOME },
        { name: 'Shop', path: WEBSITE_SHOP },
        { name: category.name, path: WEBSITE_CATEGORY(category.slug) },
    ]

    const collectionJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': `${categoryUrl(category.slug)}#collection`,
        name: category.name,
        description: metaDescription(category),
        url: categoryUrl(category.slug),
        isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: absoluteUrl('/') },
        ...(category.cover ? { image: category.cover.src } : {}),
        mainEntity: {
            '@type': 'ItemList',
            numberOfItems: total,
            itemListElement: products.map((product, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                url: absoluteUrl(productHref({ ...product, categorySlug: category.slug })),
                name: product.name,
            })),
        },
    }

    return (
        <>
            <JsonLd data={collectionJsonLd} />
            <JsonLd data={breadcrumbJsonLd(crumbs)} />
            {category.faqs.length > 0 && <JsonLd data={faqJsonLd(category.faqs)} />}

            <WebsiteBreadcrumb props={{ title: category.name }} />

            <section className="website-gutter bg-background pb-10 pt-2 font-neue lg:pb-14">
                <Breadcrumb className="mb-6 lg:mb-8">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href={WEBSITE_HOME}>Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href={WEBSITE_SHOP}>Shop</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{category.name}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <header className={`grid items-center gap-6 lg:gap-12 ${category.cover ? 'lg:grid-cols-[1.1fr_1fr]' : ''}`}>
                    <div className="flex flex-col gap-4">
                        <p className="text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-[var(--dark-red)]/70">
                            {total > 0 ? `${total} ${total === 1 ? 'style' : 'styles'}` : 'Collection'}
                        </p>
                        <h1 className="font-neue text-[clamp(2rem,5vw,3.75rem)] font-medium uppercase leading-[0.95] text-[var(--dark-red-2)]">
                            {category.name}
                        </h1>
                        {intro.length > 0 && (
                            <div className="flex max-w-2xl flex-col gap-3 text-[0.95rem] leading-relaxed text-[var(--text-body)]">
                                {intro.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                            </div>
                        )}
                        {total > 0 && (
                            <div className="flex flex-wrap gap-3 pt-2">
                                <BrandOutlineButton asChild className="w-auto px-5">
                                    <Link href={shopFilterHref(category.slug)}>
                                        <SlidersHorizontal className="size-4" />
                                        Filter &amp; sort
                                    </Link>
                                </BrandOutlineButton>
                            </div>
                        )}
                    </div>

                    {category.cover && (
                        <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius)] bg-[var(--product-card-bg)]">
                            <Image
                                src={category.cover.src}
                                alt={category.cover.alt}
                                fill
                                priority
                                sizes="(max-width: 1024px) 100vw, 45vw"
                                className={`object-cover ${COVER_POSITION_CLASS[category.cover.position] || 'object-center'}`}
                            />
                        </div>
                    )}
                </header>

                {products.length > 0 ? (
                    <>
                        <h2 className="sr-only">{category.name} products</h2>
                        <div className="grid grid-cols-2 gap-4 pt-10 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
                            {products.map((product, index) => (
                                <ProductBox
                                    key={product._id}
                                    product={{ ...product, categorySlug: category.slug }}
                                    priority={index < 4 && !category.cover}
                                />
                            ))}
                        </div>
                        {total > products.length && (
                            <div className="mx-auto mt-10 max-w-xs">
                                <BrandButton asChild>
                                    <Link href={shopFilterHref(category.slug)}>View all {total} styles</Link>
                                </BrandButton>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="mt-10 flex flex-col items-center gap-3 rounded-[var(--radius)] border border-dashed border-foreground/15 px-6 py-14 text-center">
                        <p className="font-neue text-xl font-medium uppercase text-[var(--dark-red-2)]">New styles coming soon</p>
                        <p className="max-w-md text-sm text-muted-foreground">We&apos;re stitching the next pieces for this collection. Meanwhile, explore the rest of the shop.</p>
                        <div className="mt-2 w-48">
                            <BrandButton asChild>
                                <Link href={WEBSITE_SHOP}>Browse the shop</Link>
                            </BrandButton>
                        </div>
                    </div>
                )}
            </section>

            {category.faqs.length > 0 && (
                <FAQSection faqs={category.faqs} eyebrow={category.name} title="Questions & answers" topics="Fit · Fabric · Care" />
            )}

            {related.length > 0 && (
                <nav aria-label="More categories" className="website-gutter bg-background pb-14 font-neue">
                    <h2 className="mb-4 text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-[var(--dark-red)]/70">Explore more</h2>
                    <ul className="flex flex-wrap gap-2">
                        {related.map((item) => (
                            <li key={item.slug}>
                                <Link
                                    href={WEBSITE_CATEGORY(item.slug)}
                                    className="inline-flex h-9 items-center rounded-full border border-foreground/15 px-4 text-sm font-medium uppercase tracking-[0.04em] text-[var(--dark-red-2)] transition hover:border-[var(--dark-red)] hover:bg-[var(--dark-red)] hover:text-white"
                                >
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            )}
        </>
    )
}

export default CategoryPage
