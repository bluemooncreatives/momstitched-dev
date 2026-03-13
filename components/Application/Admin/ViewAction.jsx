import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Eye } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const ViewAction = ({ href }) => {
    return (
        <DropdownMenuItem key="view" asChild>
            <Link className='flex items-center gap-2 cursor-pointer' href={href}>
                <Eye className='size-4' />
                View
            </Link>
        </DropdownMenuItem>
    )
}

export default ViewAction