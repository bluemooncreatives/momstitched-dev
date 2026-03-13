'use client'
import React from 'react'
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
                    <div className="flex aspect-square size-16 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                        <img
                            src="/assets/images/logo-black.png"
                            alt="MomStitched"
                            className="size-16 object-contain"
                        />
                    </div>
                    <div className="grid flex-1 text-start text-sm leading-tight">
                        <span className="truncate font-semibold">{activeTeam.name}</span>
                        <span className="truncate text-xs">{activeTeam.plan}</span>
                    </div>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}

export default TeamSwitcher
