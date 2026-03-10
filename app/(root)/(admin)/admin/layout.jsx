import AppSidebar from '@/components/Application/Admin/AppSidebar'
import ThemeProvider from '@/components/Application/Admin/ThemeProvider'
import Topbar from '@/components/Application/Admin/Topbar'
import { SidebarProvider } from '@/components/ui/sidebar'
import React from 'react'

const layout = ({ children }) => {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <SidebarProvider>
                <AppSidebar />
                <main className="md:w-[calc(100vw-16rem)] w-full overflow-x-hidden bg-slate-50 text-slate-900" >
                    <div className='pt-[76px] md:px-10 px-6 min-h-[calc(100vh-40px)] pb-12'>
                        <Topbar />
                        {children}
                    </div>

                    <div className='border-t border-slate-200 h-[40px] flex justify-center items-center bg-slate-50 text-sm text-slate-500'>
                        2026 MomStitched
                    </div>
                </main>
            </SidebarProvider>
        </ThemeProvider>
    )
}

export default layout