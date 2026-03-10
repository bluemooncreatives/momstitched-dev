import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import adminLogo from '@/public/assets/images/admin-logo.png'
import { useSelector } from "react-redux"

import { IoShirtOutline } from "react-icons/io5";
import { MdOutlineShoppingBag } from "react-icons/md";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import { ADMIN_ORDER_SHOW, ADMIN_PRODUCT_ADD } from "@/routes/AdminPanelRoute";

const UserDropdown = () => {
    const auth = useSelector((store) => store.authStore.auth)
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer">
                    <Avatar className="w-10 h-10">
                        <AvatarImage src={adminLogo.src} />
                    </Avatar>
                    <div className="hidden md:block text-left">
                        <p className="text-sm font-semibold text-slate-900">{auth?.name || 'Admin User'}</p>
                        <p className="text-xs text-slate-500">{auth?.email || 'admin@mail.com'}</p>
                    </div>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="me-5 w-44">
                <DropdownMenuLabel>
                    <p className="font-semibold">{auth?.name}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href={ADMIN_PRODUCT_ADD} className="cursor-pointer">
                        <IoShirtOutline />
                        New Product
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={ADMIN_ORDER_SHOW} className="cursor-pointer">
                        <MdOutlineShoppingBag />
                        Orders
                    </Link>
                </DropdownMenuItem>

                <LogoutButton />

            </DropdownMenuContent>
        </DropdownMenu>

    )
}

export default UserDropdown