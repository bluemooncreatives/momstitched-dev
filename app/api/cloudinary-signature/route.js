import { isAuthenticated } from "@/lib/authentication";
import cloudinary from "@/lib/cloudinary";
import { catchError, response } from "@/lib/helperFunction";
import { NextResponse } from "next/server";

// A signature authorises an upload to our Cloudinary account, so only admins
// get one — and never for params that would let an upload replace an existing
// asset (a chosen public_id plus overwrite would swap a live product photo).
const FORBIDDEN_PARAMS = ['public_id', 'overwrite', 'invalidate', 'type', 'resource_type']

export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        const { paramsToSign } = await request.json()
        if (!paramsToSign || typeof paramsToSign !== 'object' || Array.isArray(paramsToSign)) {
            return response(false, 400, 'Invalid signature request.')
        }

        const forbidden = FORBIDDEN_PARAMS.find((key) => key in paramsToSign)
        if (forbidden) {
            return response(false, 400, `Uploads may not set "${forbidden}".`)
        }

        const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_SECRET_KEY)

        return NextResponse.json({ signature })

    } catch (error) {
        return catchError(error)
    }
}
