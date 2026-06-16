'use client'
import ButtonLoading from '@/components/Application/ButtonLoading'
import UserPanelLayout from '@/components/Application/Website/UserPanelLayout'
import WebsiteBreadcrumb from '@/components/Application/Website/WebsiteBreadcrumb'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import useFetch from '@/hooks/useFetch'
import { zSchema } from '@/lib/zodSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import Dropzone from 'react-dropzone'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import userIcon from '@/public/assets/images/user.png'
import { Camera, User } from 'lucide-react'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { login } from '@/store/reducer/authReducer'

const breadCrumbData = {
    title: 'Profile',
    links: [{ label: 'Profile' }]
}

const Profile = () => {
    const dispatch = useDispatch()
    const { data: user } = useFetch('/api/profile/get')
    const [loading, setLoading] = useState(false)
    const [preview, setPreview] = useState()
    const [file, setFile] = useState()
    const MAX_IMAGE_BYTES = 5 * 1024 * 1024
    const formSchema = zSchema.pick({
        name: true, phone: true, address: true
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            phone: "",
            address: "",
        }
    })

    useEffect(() => {
        if (user && user.success) {
            const userData = user.data
            form.reset({
                name: userData?.name,
                phone: userData?.phone,
                address: userData?.address,
            })

            setPreview(userData?.avatar?.url)
        }
    }, [user])


    const handleFileSelection = (files) => {
        const file = files[0]
        if (!file) {
            return
        }
        if (file.size > MAX_IMAGE_BYTES) {
            showToast('error', 'Upload failed. Max image size is 5 MB.')
            return
        }
        const preview = URL.createObjectURL(file)
        setPreview(preview)
        setFile(file)
    }

    const updateProfile = async (values) => {
        setLoading(true)
        try {
            let formData = new FormData()
            if (file) {
                formData.set('file', file)
            }
            formData.set('name', values.name)
            formData.set('phone', values.phone)
            formData.set('address', values.address)

            const { data: response } = await axios.put('/api/profile/update', formData)
            if (!response.success) {
                throw new Error(response.message)
            }

            showToast('success', response.message)
            dispatch(login(response.data))
        } catch (error) {
            showToast('error', error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <WebsiteBreadcrumb props={breadCrumbData} />
            <UserPanelLayout>
                <div className="rounded-[var(--radius)] border border-[var(--dark-red)]/20 bg-background">

                    {/* Section header */}
                    <div className="flex items-center gap-2 border-b border-[var(--dark-red)]/20 px-5 py-4">
                        <User className="size-4 text-[var(--brand-primary)]" />
                        <h2 className="text-lg font-semibold text-[var(--brand-primary)]">
                            My Profile
                        </h2>
                    </div>

                    <div className="p-5 sm:p-6">
                        <Form {...form}>
                            <form className='grid md:grid-cols-2 grid-cols-1 gap-5' onSubmit={form.handleSubmit(updateProfile)}>
                                {/* Avatar */}
                                <div className='md:col-span-2 col-span-1 flex justify-center items-center'>
                                    <div className="flex flex-col items-center gap-2">
                                        <Dropzone
                                            onDrop={(acceptedFiles) => handleFileSelection(acceptedFiles)}
                                            maxSize={MAX_IMAGE_BYTES}
                                            accept={{ 'image/*': [] }}
                                        >
                                            {({ getRootProps, getInputProps }) => (
                                                <div {...getRootProps()}>
                                                    <input {...getInputProps()} />
                                                    <Avatar className="w-28 h-28 relative group border-2 border-[var(--dark-red)]/40 transition-all duration-200 hover:border-[var(--dark-red)]">
                                                        <AvatarImage src={preview ? preview : userIcon.src} />
                                                        <div className='absolute z-50 w-full h-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 justify-center items-center border-2 border-[var(--dark-red)] rounded-full group-hover:flex hidden cursor-pointer bg-black/20'>
                                                            <Camera className='size-4 text-white' />
                                                        </div>
                                                    </Avatar>
                                                </div>
                                            )}
                                        </Dropzone>
                                        <p className="text-sm text-foreground/60">Max image size: 5 MB.</p>
                                    </div>
                                </div>

                                {/* Name */}
                                <div className='mb-3'>
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-semibold text-foreground/60">Name</FormLabel>
                                                <FormControl>
                                                    <Input type="text" placeholder="Enter your name" className="h-11 text-base" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Phone */}
                                <div className='mb-3'>
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-semibold text-foreground/60">Phone</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="Enter your phone number" className="h-11 text-base" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Address */}
                                <div className='mb-3 md:col-span-2 col-span-1'>
                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-semibold text-foreground/60">Address</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Enter your address" className="min-h-[120px] text-base resize-y" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Submit */}
                                <div className='mb-3 md:col-span-2 col-span-1'>
                                    <ButtonLoading
                                        loading={loading}
                                        type="submit"
                                        text="Save Changes"
                                        variant="brand"
                                        className="h-11 px-8 text-base font-semibold cursor-pointer"
                                    />
                                </div>
                            </form>
                        </Form>
                    </div>

                </div>
            </UserPanelLayout>
        </div>
    )
}

export default Profile

