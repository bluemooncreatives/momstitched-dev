# MomStitched — Feature List

A full-stack Next.js 15 (App Router) e-commerce platform for a clothing brand, with an integrated admin panel, Razorpay payments, Cloudinary media, Google/password auth, Delhivery shipment tracking, and transactional email.

**Stack**: Next.js 15 + React 19, MongoDB/Mongoose 8, NextAuth (Google OAuth) + custom JWT (jose), Redux Toolkit + redux-persist, TanStack Query/Table, react-hook-form + zod, Razorpay, Cloudinary, CKEditor 5, Recharts, GSAP + Lenis, @react-pdf/renderer, Nodemailer, Tailwind 4 + shadcn/radix-ui ("radix-nova" theme).

---

## Feature Summary

1. Full online storefront with home page, shop/product listing, and individual product pages.
2. Product filtering by category, color, size, and price range, plus sort by price/name/newest.
3. Site-wide search with instant/fuzzy product and page matching.
4. Product pages with multiple images, color and size selection, live stock/availability per combination, and a size guide chart.
5. Shopping cart (drawer + full page) with quantity controls and persistent cart across visits.
6. Multi-step checkout with address entry, saved-address autofill, and coupon code support.
7. Two payment options at checkout: Cash on Delivery, or online payment via Razorpay (supports full payment or 30%/50% partial payment).
8. Secure server-side verification of prices and payments — totals and payment signatures are re-checked before any order is saved, preventing price tampering.
9. Customer accounts with email/password login and "Sign in with Google".
10. Two-factor style login (password plus a one-time email code) for password accounts.
11. Email verification on signup and a welcome email once confirmed.
12. Forgot-password flow via emailed one-time code.
13. Ability to set/change password even for accounts that originally signed up with Google only.
14. Orders placed as a guest before creating an account are automatically linked once the customer verifies that email.
15. Customer profile management: name, phone, avatar photo, and saved shipping address.
16. Order history with detailed order view, live shipment tracking timeline, and downloadable PDF invoices.
17. Product reviews with star ratings, written feedback, and a rating summary/distribution on each product.
18. Homepage marketing sections: hero banner slider, bestsellers carousel, freshly-arrived products, category highlights, brand story teaser, customer testimonials, FAQ, and trust/benefit badges.
19. About Us, Contact Us (with support ticket confirmation), Privacy Policy, and Terms & Conditions pages.
20. Contact form submissions generate a trackable support ticket number and send confirmation/notification emails automatically.
21. Search-engine optimization: auto-generated sitemap, robots rules, and social share previews for products.
22. Fast, smooth browsing experience with animated transitions, lazy-loading, and optimized images.
23. Full admin dashboard with sales overview, order status breakdown, monthly sales chart, and recent activity feeds.
24. Product management (add/edit/delete) with rich-text descriptions, multiple images, pricing, and category/size-guide assignment.
25. Product variant management for colors, sizes, and per-variant pricing/images/SKUs.
26. Category management.
27. Size guide builder for creating custom size charts per product type.
28. Coupon/discount code management (percentage discount, minimum spend, expiry date).
29. Curated "Bestsellers" and "Freshly Arrived" product collections that admins can hand-pick and reorder for the homepage/shop.
30. Order management: view all orders, update order status, and automatic email notifications to customers on status changes.
31. Shipment tracking integration (Delhivery courier) — create shipments, track AWB numbers, and auto-sync delivery status daily.
32. Customer list management.
33. Product review moderation (view/remove reviews).
34. Testimonial management for curating homepage customer quotes.
35. Media library with drag-and-drop image uploads, reusable across products and content.
36. Contact/support ticket inbox with read/unread tracking and quick email reply.
37. Recycle bin (trash) for recovering or permanently deleting accidentally removed items across products, orders, customers, coupons, and more.
38. Global admin search for quickly finding any section of the admin panel.
39. Light/dark theme support in the admin panel.
40. Role-based access control — separate permissions for admin staff vs. regular customers, enforced on every page and API request.
41. Automated transactional emails: order confirmation, order status updates, OTP codes, password change alerts, email verification, welcome email, and contact form confirmations.
42. Secure infrastructure: encrypted sessions, security headers, and safe handling of uploaded files.

---

## 1. Data Model (`models/`)

| Model | Purpose |
|---|---|
| **User** | Role (`user`/`admin`), email/password (bcrypt, optional — Google-only accounts allowed), Google linkage (`googleId`, `googleProfile`, avatar), email verification flag, saved default shipping address. |
| **Product** | Name, unique `parentSku`, unique `slug`, category ref, optional size-guide ref, MRP/sellingPrice/discountPercentage, media refs, HTML description, bestseller/freshly-arrived curation flags + sort order, soft-delete. |
| **ProductVariant** | Product ref, color (auto-normalized), optional hex override, size, own pricing, unique `sku` (must be prefixed with parent's `parentSku`), media refs. **No stock/inventory field exists in the schema.** |
| **Category** | Name + unique slug, soft-delete. |
| **Coupon** | Uppercased unique code, discount %, minimum spend, expiry date. |
| **Order** | Contact/shipping snapshot, embedded line items (product/variant/name/qty/mrp/sellingPrice), subtotal/discount/total, payment method (cod/full/partial 30-50-100%), payment status, order status (pending/processing/shipped/delivered/cancelled/unverified), embedded **shipment sub-document** (courier, AWB, 9-state shipment status enum, dimensions, tracking URL, timestamps) with normalization helpers for legacy records. |
| **Review** | Product + user refs, rating/title/body, soft-delete (moderation). |
| **Testimonial** | Admin-authored homepage quotes (name/review/rating/active/sortOrder) — distinct from product Reviews. |
| **SizeGuide** | Named, typed (8 garment types) column/row size-chart data, reusable across products. |
| **Media** | Cloudinary asset metadata (public_id, URLs, alt/title), referenced by Product/ProductVariant. |
| **Contact** | Support ticket (`MS-XXXXXXXX` ID), sender info, subject/message, read flag. |
| **Otp** | Email + 6-digit code, TTL-indexed (Mongo auto-expires after 10 min). |

---

## 2. Authentication & Authorization

- **Account model**: one account per email; Google OAuth and email/password can coexist on the same User (account linking on matching email).
- **Login flow (2-factor style)**: password check → OTP emailed → OTP verified → 24h custom JWT issued as an httpOnly `access_token` cookie.
- **Registration**: password signup → emailed JWT verification link (1h expiry) → account marked verified → welcome email.
- **Password reset**: email → OTP → new password (also lets a Google-only account gain a password).
- **Google OAuth** (NextAuth, JWT session strategy): auto-creates or links an account; can also be used to gain email-verified status.
- **Guest-order claiming**: any order placed with no account, once the same (now-verified) email logs in/registers, is auto-linked to that account (`claimGuestOrders`) — never trusts unverified email claims.
- **Route protection**: `middleware.js` is the sole authoritative gate — checks custom JWT cookie first, falls back to NextAuth session; protects `/admin/*` (admin role), `/my-account`, `/profile`, `/orders`, `/order-details`, `/checkout` (user role); redirects unauthenticated users to login with a `callback` param.
- **Server-side re-checks**: sensitive routes (orders, invoices, profile) independently re-verify identity/ownership via `isAuthenticated`/`getCurrentUser`/`userCanViewOrder` — never trust the client-supplied email for access control.
- **Session hydration**: `AuthHydrator` calls `/api/auth/me` on mount to populate Redux `authStore` (not persisted to localStorage — always re-derived from the server).

---

## 3. Customer-Facing Website

### Product Discovery
- Home page curated rails: Featured, Bestsellers, Freshly Arrived (admin-curated with auto-fill), Category/Color archive, Instagram reel marquee.
- **Shop page**: server-rendered default listing + client-side dynamic filtering (category, color, size, price range, bestseller/freshly-arrived toggles) and sorting (name/price asc-desc/default), URL-synced filters, responsive pagination.
- **Global search**: Cmd/Ctrl-K command palette (Fuse.js fuzzy match for pages + live product search), recent-search history.
- **Product detail page**: image gallery, non-blocking color/size switching via links, availability matrix (grays out out-of-stock-combo swatches), quantity stepper synced to cart, size guide modal, star ratings, full description, "You May Also Like" related-products rail.

### Cart & Checkout
- Redux-backed cart (persisted to localStorage), drawer + full-page views, per-line quantity controls (capped 1–10).
- Checkout: server-side cart re-verification (price/existence), profile-address prefill + save-back-to-profile option, coupon apply/remove with live recompute.
- Payment methods: **Cash on Delivery**, or **Razorpay** (full or 30%/50% partial payment) — client creates a Razorpay order, completes checkout widget, server independently verifies the payment signature and recomputes all totals server-side before persisting the order (never trusts client-submitted amounts).
- Order confirmation email; redirect to order-details page; cart cleared on success.

### Account
- Email/password + Google login, registration, email verification, OTP-based password reset.
- Profile management: avatar upload, contact info, saved shipping address, set/change password (dual-mode for Google-only vs. password accounts).
- Order history list + detail view (ownership-enforced), **shipment tracking timeline** (5-stage visual tracker mapped from courier status), downloadable **PDF invoice**.
- My-account dashboard: order count/cart stat cards, recent orders.

### Reviews
- Star-rating summary + distribution bars, infinite-scroll paginated review list, login-gated review submission (no purchase-verification gate).

### Marketing / Content Pages
- Animated (GSAP) homepage sections: hero slider, featured/bestseller carousels, category archive, about-us teaser, benefits/trust badges, FAQ accordion, editorial cards, testimonial carousel (falls back to defaults if none configured).
- About Us (founder bios, brand story), Contact (form → support ticket + confirmation email), Privacy Policy, Terms & Conditions.
- SEO: dynamic sitemap (all product slugs, hourly revalidation), robots.txt, per-product OpenGraph metadata.

### Performance/UX patterns
- `LazyHydrate` (IntersectionObserver-gated hydration) for below-the-fold sections; heavy client chunks code-split with `next/dynamic`; one-time session intro loader; Lenis smooth scroll (disabled on admin/auth/reduced-motion/low-end connections); Cloudinary-driven responsive images with a custom loader.

---

## 4. Admin Panel (`/admin/**`, role-gated)

- **Dashboard**: KPI cards (categories/products/customers/orders with MoM trend), monthly sales bar chart, order-status donut chart, latest orders/reviews tables, quick-add tiles.
- **Product management**: CRUD with rich-text description (CKEditor 5), multi-image picker, auto-computed discount %, category/size-guide linking, CSV export, soft-delete + trash/restore.
- **Product variant management**: CRUD (color/size/price/SKU with enforced parent-SKU-prefix rule), color hex picker with suggested palette.
- **Category management**: simple CRUD with slug auto-generation.
- **Size guide builder**: dynamic spreadsheet-style column/row editor, typed per garment category.
- **Coupon management**: CRUD (code, discount %, min spend, expiry).
- **Bestseller / Freshly Arrived curation**: add/remove/reorder (up-down, dirty-tracked "Save Order") products shown on storefront rails; Freshly Arrived enforces a minimum of 9.
- **Order management**: list + detail view, status updates (triggers customer status-change email), **shipment management widget** — create/sync shipment with a Delhivery courier integration, AWB tracking, dimension entry.
- **Customer list**: read-only view of registered users.
- **Review moderation**: view/delete (soft or permanent).
- **Testimonial management**: full CRUD, reorder, active/inactive toggle for homepage display.
- **Media library**: infinite-scroll grid, Cloudinary direct-upload widget (5MB cap, multiple sources), reusable picker modal for product/variant forms, trash/restore/permanent-delete.
- **Contact queries**: inbox-style list/detail view of support tickets with auto-read-tracking and mailto reply.
- **Unified trash/recycle bin**: soft-delete → restore/permanently-delete flow shared across nearly every entity.
- **Admin search**: Ctrl+K global admin command palette.
- Consistent infra: server-driven TanStack Table (pagination/sort/filter), react-hook-form + zod validation, light/dark theme switch.

---

## 5. Backend API Surface (`app/api/`)

- **Auth**: register, login (password→OTP), verify-otp (issues session), resend-otp, reset-password (send-otp/verify-otp/update-password), verify-email, logout, `me` (session hydration), NextAuth Google handler.
- **Catalog**: product & product-variant CRUD/export/trash (admin), public featured/detail/colors/sizes endpoints (cached with `unstable_cache` + tag-based revalidation), category CRUD + public list.
- **Commerce**: shop listing (filter/sort/search/paginate via Mongo aggregation), cart-verification (re-prices/purges stale cart lines), coupon CRUD + public apply endpoint.
- **Curation**: bestseller/freshly-arrived add/reorder/remove + "available to add" pickers.
- **Orders**: admin list/export/detail/status-update/trash; user-scoped order list (strictly `user`-matched, never by email) and dashboard stats; PDF invoice generation (ownership-checked).
- **Payments**: Razorpay order creation, order-save with full server-side price/signature re-verification.
- **Content**: reviews (public read/summary, authenticated create, admin moderation), testimonials (admin CRUD+reorder), size guides (admin CRUD), media (admin CRUD + Cloudinary-synced delete), contact form (public submit + admin inbox).
- **Ops**: dashboard analytics aggregations, daily cron (`/api/cron/sync-shipments`, secret-protected) that batch-syncs shipment tracking status from the courier for all in-transit orders.
- **Dev/utility**: `cloudinary-signature` (client upload signing), `faker/product` (dev seed data), `test` (DB connectivity check).
- Cross-cutting conventions: standard `{success, statusCode, message, data}` response envelope, centralized Mongo error handling, zod validation via a shared schema object, server-authoritative pricing (`lib/pricing.js` — client discount % is always ignored and recomputed), uniform soft-delete/restore/permanent-delete (`SD`/`RSD`/`PD`) pattern across nearly every resource.

---

## 6. Infrastructure & Cross-Cutting Systems

- **State management**: Redux Toolkit (`cartStore` persisted, `authStore` server-hydrated only) + TanStack Query for all server-state (queries/mutations), cleanly separated.
- **Design system**: centralized CSS token file (`app/design-system.css`) — brand oxblood/crimson/cream palette in both legacy and shadcn-semantic (`oklch`) variables; shadcn "radix-nova" component set (30 primitives) with custom extensions (navbar, phone-input, OTP input, chart).
- **Transactional email**: 8 hand-built table-based HTML templates (Outlook-safe) sharing one brand shell — OTP, email verification, welcome, order confirmation, order status update, password-changed security notice, contact confirmation + internal notification.
- **Media pipeline**: Cloudinary direct-upload (signed), custom `next/image` loader injecting Cloudinary transforms, DB/Cloudinary transactional consistency on permanent delete.
- **PDF generation**: `@react-pdf/renderer` for downloadable order invoices (Node runtime only).
- **Shipment tracking**: embedded shipment sub-document on Order, admin creation/sync UI, and a scheduled daily cron job for automatic status refresh from the courier (Delhivery).
- **Animation**: GSAP + `@gsap/react` + custom SplitType (vendored) for scroll/text reveal effects across hero, footer, about, testimonials, FAQ; Lenis for smooth scrolling.
- **Security headers**: CSP scoped to Razorpay + Cloudinary, HSTS, X-Frame-Options, COOP, Permissions-Policy (`next.config.mjs`).
- **SEO/robots**: dynamic sitemap generation, crawler rules excluding private/app routes.

---

## 7. Notable Gaps / Dead Code Observed During Audit

- No inventory/stock tracking exists anywhere in the live schema — `cart-verification` re-checks price/existence only, not availability.
- `app/api/product/create-with-variants/route.js` is an empty, non-functional file.
- `app/api/cloudinary-signature` and `app/api/faker/product` have no auth gate (the latter is presumably dev-only but is live in the deployed API surface).
- Dashboard admin analytics routes have a `catch { }` block that doesn't bind the caught error, which would throw instead of returning a clean error response on real failures.
- No wishlist feature is actually wired up — a heart-icon toggle exists on an unused component (`FeaturedProductCard.jsx`) with no persistence.
- `MainSlider.jsx` is unused/dead code.
