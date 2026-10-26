import { isAuthenticated } from "@/lib/authentication";
import { revalidateCatalogue } from "@/lib/catalogueCache";
import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { MAX_UPLOAD_BATCH, registerUploads } from "@/lib/mediaLibrary";
import { z } from "zod";

// Only the Cloudinary public_id is trusted from the client; registerUploads
// reads everything else (URL, size, format) from Cloudinary itself.
const payloadSchema = z.array(
    z.object({ public_id: z.string().trim().min(1).max(255) }).passthrough()
).min(1, 'No media provided.').max(MAX_UPLOAD_BATCH, `Register at most ${MAX_UPLOAD_BATCH} images at a time.`)

export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        const validate = payloadSchema.safeParse(await request.json())
        if (!validate.success) {
            return response(false, 400, validate.error.issues[0]?.message || 'Invalid media payload.')
        }

        await connectDB()

        // No Cloudinary cleanup on failure: assets that were uploaded stay put,
        // so the client can retry registration without re-uploading — and an
        // error can never delete an asset that is already in the library.
        const { media, rejected } = await registerUploads(validate.data.map((item) => item.public_id))

        if (media.length) revalidateCatalogue()

        if (!media.length) {
            return response(false, 400, rejected[0]?.reason || 'Upload failed.', { media, rejected })
        }

        const message = rejected.length
            ? `${media.length} added. ${rejected.length} rejected: ${rejected[0].reason}`
            : 'Media upload successfully.'
        return response(true, 200, message, { media, rejected })

    } catch (error) {
        return catchError(error)
    }
}
