import { jwtVerify } from "jose"
import { cookies } from "next/headers"
import { getToken } from "next-auth/jwt"

export const isAuthenticated = async (role, request = null) => {
    try {
        const cookieStore = await cookies()
        let resolvedRole = null
        let userId = null
        let email = null

        if (cookieStore.has('access_token')) {
            const access_token = cookieStore.get('access_token')
            const { payload } = await jwtVerify(access_token.value, new TextEncoder().encode(process.env.SECRET_KEY))
            resolvedRole = payload.role
            userId = payload._id
            if (payload.email) {
                email = payload.email
            }
        } else if (request) {
            const nextAuthToken = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
            if (nextAuthToken) {
                resolvedRole = nextAuthToken.role
                userId = nextAuthToken.userId || nextAuthToken.sub
                email = nextAuthToken.email || null
            }
        }

        if (!resolvedRole || !userId) {
            return {
                isAuth: false
            }
        }

        if (resolvedRole !== role) {
            return {
                isAuth: false
            }
        }

        return {
            isAuth: true,
            userId,
            email
        }

    } catch (error) {
        return {
            isAuth: false,
            error
        }
    }
}
