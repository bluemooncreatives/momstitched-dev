'use client'
import Image from 'next/image'
import logoWhite from '@/public/assets/images/logo-white.webp'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'

const TeamSwitcher = ({ teams = [] }) => {
    const activeTeam = teams[0]

    if (!activeTeam) return null

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    size="lg"
                    className="cursor-default hover:bg-transparent hover:text-inherit"
                >
                    <div className="flex aspect-square items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                        <Image
                            src={logoWhite}
                            alt="MomStitched"
                            width={42}
                            height={42}
                            className="object-contain"
                            priority
                        />
                    </div>
                    <div className="grid flex-1 text-start text-md leading-tight">
                        <span className="truncate font-semibold font-header">
                            {activeTeam.name}
                        </span>
                        <span className="truncate text-sm">{activeTeam.plan}</span>
                    </div>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}

export default TeamSwitcher
