import { adminNavGroups } from '@/lib/adminSidebarMenu'
import { Command, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'

const MomStitchedMark = ({ className }) => (
    <span className={cn('text-[10px] font-bold tracking-tight', className)}>MS</span>
)

const teams = [
    {
        name: 'MomStitched',
        logo: MomStitchedMark,
        plan: 'Admin Panel',
    },
    {
        name: 'MomStitched Pro',
        logo: Crown,
        plan: 'Operations',
    },
    {
        name: 'Studio',
        logo: Command,
        plan: 'Merch',
    },
]

const mapNavItem = (item) => {
    const mapped = {
        title: item.title,
        url: item.url,
        icon: item.icon,
        badge: item.badge,
    }

    if (item.submenu && item.submenu.length > 0) {
        mapped.items = item.submenu.map((sub) => ({
            title: sub.title,
            url: sub.url,
            icon: sub.icon,
            badge: sub.badge,
        }))
    }

    return mapped
}

const navGroups = adminNavGroups.map((group) => ({
    title: group.title,
    items: group.items.map(mapNavItem),
}))

export const sidebarData = {
    teams,
    navGroups,
}
