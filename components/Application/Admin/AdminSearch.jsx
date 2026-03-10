import { Input } from '@/components/ui/input'
import React, { useState } from 'react'
import { IoIosSearch } from "react-icons/io";
import SearchModel from './SearchModel';

const AdminSearch = () => {
    const [open, setOpen] = useState(false)
    return (
        <div className='md:w-[400px]'>
            <div className='flex items-center relative'>
                <IoIosSearch className='absolute left-4 text-slate-400 w-5 h-5 pointer-events-none' />
                <Input
                    readOnly
                    className="rounded-full cursor-pointer h-11 pl-12 pr-16 bg-slate-50 border border-slate-200 shadow-none text-slate-700 placeholder:text-slate-400"
                    placeholder="Search task"
                    onClick={() => setOpen(true)}
                />
                <div className='absolute right-4 flex items-center gap-1 text-xs text-slate-400 font-medium pointer-events-none'>
                    <span className='px-1.5 py-0.5 rounded border border-slate-300 bg-white text-slate-500'>⌘</span>
                    <span className='px-1.5 py-0.5 rounded border border-slate-300 bg-white text-slate-500'>F</span>
                </div>
            </div>

            <SearchModel open={open} setOpen={setOpen} />
        </div>
    )
}

export default AdminSearch