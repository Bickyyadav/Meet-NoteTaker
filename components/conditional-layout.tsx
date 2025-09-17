"use client"
import { useAuth } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
import React, { ReactNode } from 'react'
import { SidebarProvider } from './ui/sidebar'
import { AppSidebar } from './app-sidebar'

const ConditionalLayout = ({ children }: { children: ReactNode }) => {
    const pathname = usePathname()
    const { isSignedIn } = useAuth()

    const showSidebar = pathname !== "/" && !(pathname.startsWith("/meeting/") && !isSignedIn)
    if (!showSidebar) {
        return <div className='min-h-screen'>{children}</div>
    }
    return (
        <SidebarProvider defaultOpen={true}>
            <div className='flex h-screen w-full'>
                <AppSidebar />
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </SidebarProvider>
    )
}

export default ConditionalLayout
