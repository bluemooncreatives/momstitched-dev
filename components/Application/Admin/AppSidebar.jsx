'use client'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from "@/components/ui/sidebar"
import Image from "next/image"
import logoBlack from '@/public/assets/images/logo-black.png'
import logoWhite from '@/public/assets/images/logo-white.png'
import { Button } from "@/components/ui/button"
import { LuChevronRight } from "react-icons/lu";
import { IoMdClose } from "react-icons/io";
import { LuLogOut } from "react-icons/lu";
import { adminAppSidebarMenu } from "@/lib/adminSidebarMenu"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useDispatch } from "react-redux"
import { logout as logoutAction } from "@/store/reducer/authReducer"
import { showToast } from "@/lib/showToast"
import { useState } from "react"

const AppSidebar = () => {
    const pathname = usePathname()
    const router = useRouter()
    const dispatch = useDispatch()
    const { toggleSidebar } = useSidebar()
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true)
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            const data = await response.json()

            if (data.success) {
                dispatch(logoutAction())
                showToast('success', data.message || 'Logged out successfully')
                router.push('/auth/login')
            } else {
                showToast('error', data.message || 'Logout failed')
            }
        } catch (error) {
            console.error('Logout error:', error)
            showToast('error', 'An error occurred during logout')
        } finally {
            setIsLoggingOut(false)
        }
    }

    return (
        <Sidebar className="z-50 bg-transparent">
            <SidebarHeader className="border-b border-slate-100 h-20 p-0">
                <div className="flex justify-between items-center px-6 py-4">
                    <Image src={logoBlack.src} height={50} width={logoBlack.width} className="block dark:hidden h-[48px] w-auto" alt="logo dark" unoptimized />
                    <Image src={logoWhite.src} height={50} width={logoWhite.width} className="hidden dark:block h-[48px] w-auto" alt="logo white" unoptimized />
                    <Button onClick={toggleSidebar} type="button" size="icon" className="md:hidden rounded-full bg-white text-slate-700 shadow-[0_8px_24px_rgba(15,23,42,0.12)]">
                        <IoMdClose />
                    </Button>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-3 pt-8 pb-10">
                <p className="px-1 mb-3 text-[12px] font-semibold uppercase tracking-wider text-slate-400">NAVIGATION</p>
                <SidebarMenu>
                    {adminAppSidebarMenu.map((menu, index) => (
                        <Collapsible key={index} className="group/collapsible" defaultOpen={menu?.submenu?.some((sub) => sub.url === pathname) || menu.url === pathname}>
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton asChild isActive={menu.url === pathname || menu?.submenu?.some((sub) => sub.url === pathname)} className="px-2.5 text-base font-medium">
                                        <Link href={menu?.url}>
                                            <menu.icon />
                                            {menu.title}

                                            {menu.submenu && menu.submenu.length > 0 &&
                                                <LuChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                            }
                                        </Link>
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>

                                {menu.submenu && menu.submenu.length > 0
                                    &&
                                    <CollapsibleContent>
                                        <SidebarMenuSub className="mt-2 border-l border-slate-100">
                                            {menu.submenu.map((submenuItem, subMenuIndex) => (
                                                <SidebarMenuSubItem key={subMenuIndex}>
                                                    <SidebarMenuSubButton asChild className="px-3 py-2.5 text-sm rounded-2xl">
                                                        <Link href={submenuItem.url}>
                                                            {submenuItem.title}
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                }

                            </SidebarMenuItem>
                        </Collapsible>
                    ))}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="border-t border-slate-100 p-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton 
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="px-2.5 text-base font-medium hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                        >
                            <LuLogOut />
                            {isLoggingOut ? 'Logging out...' : 'Logout'}
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

        </Sidebar>
    )
}

export default AppSidebar