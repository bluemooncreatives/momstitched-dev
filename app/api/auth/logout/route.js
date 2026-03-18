import { catchError, response } from "@/lib/helperFunction";
import { cookies } from "next/headers";

export async function POST(request) {
    try {
        const cookieStore = await cookies()
        
        const authCookiePrefixes = [
            'authjs.',
            '__Secure-authjs.',
            '__Host-authjs.',
            'next-auth.',
            '__Secure-next-auth.',
            '__Host-next-auth.'
        ]

        for (const cookie of cookieStore.getAll()) {
            if (cookie.name === 'access_token' || authCookiePrefixes.some((prefix) => cookie.name.startsWith(prefix))) {
                cookieStore.delete(cookie.name)
            }
        }
        return response(true, 200, 'Logout successfull.')
    } catch (error) {
        catchError(error)
    }
}