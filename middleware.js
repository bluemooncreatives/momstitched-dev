import { NextResponse } from "next/server"
import { USER_DASHBOARD, WEBSITE_LOGIN } from "./routes/WebsiteRoute"
import { jwtVerify } from "jose/jwt/verify"
import { ADMIN_DASHBOARD } from "./routes/AdminPanelRoute"
import { getToken } from "next-auth/jwt"

export async function middleware(request) {
    try {
        const pathname = request.nextUrl.pathname
        const isAuthRoute = pathname.startsWith('/auth')
        const isUserProtectedRoute =
            pathname.startsWith('/my-account') ||
            pathname.startsWith('/profile') ||
            pathname.startsWith('/orders') ||
            pathname.startsWith('/order-details')
        const hasToken = request.cookies.has('access_token')
        const nextAuthToken = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

        let role = null
        let invalidCustomToken = false

        if (hasToken) {
            try {
                const access_token = request.cookies.get('access_token').value
                const { payload } = await jwtVerify(access_token, new TextEncoder().encode(process.env.SECRET_KEY))
                role = payload.role
            } catch (error) {
                invalidCustomToken = true
                role = null
            }
        }

        if (!role && nextAuthToken) {
            role = nextAuthToken.role || 'user'
        }

        if (!role) {
            // if the user is not loggedin and trying to access a protected route, redirect to login page. 
            if (!isAuthRoute) {
                const response = NextResponse.redirect(new URL(WEBSITE_LOGIN, request.nextUrl))
                if (invalidCustomToken) {
                    response.cookies.delete('access_token')
                }
                return response
            }
            const response = NextResponse.next()
            if (invalidCustomToken) {
                response.cookies.delete('access_token')
            }
            return response // Allow access to auth routes if not logged in. 
        }

        // prevent logged-in users from accessing auth routes 
        if (isAuthRoute) {
            return NextResponse.redirect(new URL(role === 'admin' ? ADMIN_DASHBOARD : USER_DASHBOARD, request.nextUrl))
        }


        // protect admin route  
        if (pathname.startsWith('/admin') && role !== 'admin') {
            return NextResponse.redirect(new URL(WEBSITE_LOGIN, request.nextUrl))
        }


        // protect user route  

        if (isUserProtectedRoute && role !== 'user') {
            return NextResponse.redirect(new URL(WEBSITE_LOGIN, request.nextUrl))
        }

        return NextResponse.next()

    } catch (error) {
        console.log(error)
        // Clear the expired/invalid token cookie
        const response = NextResponse.redirect(new URL(WEBSITE_LOGIN, request.nextUrl))
        response.cookies.delete('access_token')
        return response
    }
}


export const config = {
    matcher: ['/admin/:path*', '/my-account/:path*', '/profile/:path*', '/orders/:path*', '/order-details/:path*', '/auth/:path*']
}