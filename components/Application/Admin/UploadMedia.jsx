'use client'
import { Button } from '@/components/ui/button';
import { showToast } from '@/lib/showToast';
import axios from 'axios';
import { CldUploadWidget } from 'next-cloudinary';
import { Plus, RotateCw } from 'lucide-react'
import { useState } from 'react';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

/**
 * Cloudinary upload widget + library registration. Files reach Cloudinary
 * first; registering them is a separate, idempotent call, so when it fails the
 * uploaded ids are kept and "Retry" registers them again without re-uploading.
 *
 * @param {(media: object[]) => void} [onUploaded] Receives the registered library rows.
 */
const UploadMedia = ({ isMultiple, queryClient, onUploaded, label = 'Upload Media', buttonProps = {} }) => {
    const [pendingIds, setPendingIds] = useState([])
    const [registering, setRegistering] = useState(false)

    const register = async (publicIds) => {
        if (!publicIds.length) return
        setRegistering(true)
        try {
            const { data: mediaUploadResponse } = await axios.post(
                '/api/media/create',
                publicIds.map((public_id) => ({ public_id }))
            )
            // A `rejected` list means the server inspected every file — retrying
            // won't change the verdict. Anything else (outage) stays retryable.
            if (!mediaUploadResponse.success && !mediaUploadResponse.data?.rejected) {
                throw new Error('retryable')
            }
            setPendingIds([])
            if (!mediaUploadResponse.success) {
                showToast('error', mediaUploadResponse.message)
                return
            }

            queryClient?.invalidateQueries({ queryKey: ['media-data'] })
            queryClient?.invalidateQueries({ queryKey: ['MediaModal'] })
            onUploaded?.(mediaUploadResponse.data?.media || [])
            showToast(mediaUploadResponse.data?.rejected?.length ? 'warning' : 'success', mediaUploadResponse.message)
        } catch {
            // Network / server failure: keep the ids so the admin can retry.
            setPendingIds(publicIds)
            showToast('error', 'Uploaded, but could not add to the library. Use "Retry" to try again.')
        } finally {
            setRegistering(false)
        }
    }

    const handleOnError = (error) => {
        showToast('error', error?.statusText || 'Upload failed.')
    }

    const handleOnQueueEnd = async (results) => {
        const files = results?.info?.files || []
        const publicIds = files.filter((file) => file.uploadInfo?.public_id).map((file) => file.uploadInfo.public_id)
        await register(publicIds)
    }

    return (
        <CldUploadWidget
            signatureEndpoint="/api/cloudinary-signature"
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
            onError={handleOnError}
            onQueuesEnd={handleOnQueueEnd}
            config={{
                cloud: {
                    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
                    apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
                }
            }}

            options={{
                multiple: isMultiple,
                maxFiles: isMultiple ? 20 : 1,
                sources: ['local', 'url', 'unsplash', 'google_drive'],
                clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'],
                maxFileSize: MAX_IMAGE_BYTES,
            }}
        >

            {({ open }) => {
                return (
                    <div className="flex flex-col items-start gap-2">
                        <div className="flex flex-wrap gap-2">
                            <Button type="button" size="lg" disabled={registering} onClick={() => open()} {...buttonProps}>
                                <Plus className='size-4' />
                                {registering ? 'Adding to library…' : label}
                            </Button>
                            {pendingIds.length > 0 && !registering && (
                                <Button type="button" size="lg" variant="outline" onClick={() => register(pendingIds)}>
                                    <RotateCw className='size-4' />
                                    Retry ({pendingIds.length})
                                </Button>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">Max image size: 5 MB.</p>
                    </div>
                );
            }}

        </CldUploadWidget>
    )
}

export default UploadMedia
