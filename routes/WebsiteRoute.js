export const WEBSITE_HOME = "/"
export const WEBSITE_LOGIN = "/auth/login"
export const WEBSITE_REGISTER = "/auth/register"
export const WEBSITE_RESETPASSWORD = "/auth/reset-password"

export const WEBSITE_SHOP = "/shop"

export const WEBSITE_CATEGORY = (slug) => `/category/${encodeURIComponent(slug)}`

// Canonical product URL is /shop/{category}/{slug}. Callers that don't know the
// category (cart lines, orders, search) get the legacy /product/{slug}, which
// 308-redirects to the canonical URL — so every link works either way.
export const WEBSITE_PRODUCT_DETAILS = (slug, categorySlug) => {
    if (!slug) return '/product'
    return categorySlug
        ? `/shop/${encodeURIComponent(categorySlug)}/${encodeURIComponent(slug)}`
        : `/product/${encodeURIComponent(slug)}`
}

// Category slug from either a populated `category` or a flat `categorySlug`.
export const productCategorySlug = (product) =>
    product?.categorySlug || (product?.category && typeof product.category === 'object' ? product.category.slug : undefined)

export const productHref = (product) => WEBSITE_PRODUCT_DETAILS(product?.slug, productCategorySlug(product))

export const WEBSITE_CART = "/cart"
export const WEBSITE_CHECKOUT = "/checkout"
export const WEBSITE_WISHLIST = "/wishlist"

export const WEBSITE_ORDER_DETAILS = (order_id) => `/order-details/${order_id}`


// User routes 
export const USER_DASHBOARD = "/my-account"
export const USER_PROFILE = "/profile"
export const USER_ORDERS = "/orders"