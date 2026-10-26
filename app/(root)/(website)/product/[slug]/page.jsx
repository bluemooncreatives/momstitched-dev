import { notFound } from 'next/navigation'
import ProductDetails from './ProductDetails'
import { getProductDetailsBySlug, getRelatedProducts } from '@/lib/services/productService'
import { htmlToText, pickRandom } from '@/lib/utils'
import JsonLd from '@/components/Application/JsonLd'
import { breadcrumbJsonLd, productJsonLd } from '@/lib/seo'
import { WEBSITE_HOME, WEBSITE_PRODUCT_DETAILS, WEBSITE_SHOP } from '@/routes/WebsiteRoute'

export async function generateMetadata({ params }) {
    const { slug } = await params
    const productData = await getProductDetailsBySlug(slug)
    if (!productData) return { title: 'Product not found' }

    const { product } = productData
    const description = htmlToText(product?.description).slice(0, 160)
    const image = product?.media?.[0]?.secure_url

    return {
        title: product?.name,
        description,
        // ?color= / ?size= only pick a variant — collapse them onto one URL.
        alternates: { canonical: WEBSITE_PRODUCT_DETAILS(product.slug) },
        openGraph: {
            title: product?.name,
            description,
            images: image ? [{ url: image }] : [],
            type: 'website',
        },
    }
}

const ProductPage = async ({ params, searchParams }) => {
    const { slug } = await params
    const { color, size } = await searchParams

    const productData = await getProductDetailsBySlug(slug, size, color)

    if (!productData) notFound()

    // Fetch the cached pool, then randomly pick 4 so the rail varies each visit.
    const relatedPool = await getRelatedProducts(
        productData.product._id,
        productData.product.category?._id
    )
    const relatedProducts = pickRandom(relatedPool, 4)

    const { product } = productData
    // Mirrors the visible breadcrumb in ProductDetails.
    const crumbs = [
        { name: 'Home', path: WEBSITE_HOME },
        { name: 'Shop', path: WEBSITE_SHOP },
        ...(product.category?.name
            ? [{ name: product.category.name, path: `${WEBSITE_SHOP}?category=${encodeURIComponent(product.category.slug)}` }]
            : []),
        { name: product.name, path: WEBSITE_PRODUCT_DETAILS(product.slug) },
    ]

    return (
        <>
            <JsonLd data={productJsonLd(productData)} />
            <JsonLd data={breadcrumbJsonLd(crumbs)} />
            <ProductDetails
                product={productData.product}
                variant={productData.variant}
                colors={productData.colors}
                colorEntries={productData.colorEntries}
                sizes={productData.sizes}
                variantOptions={productData.variantOptions}
                reviewCount={productData.reviewCount}
                ratingAvg={productData.ratingAvg}
                relatedProducts={relatedProducts}
            />
        </>
    )
}

export default ProductPage
