import { useAuth } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
import React, { ReactNode } from 'react'
import { SidebarProvider } from './ui/sidebar'

const ConditionalLayout = ({ children }: { children: ReactNode }) => {
    const pathname = usePathname()
    const { isSignedIn } = useAuth()

    const showSidebar = pathname !== "/" && !(pathname.startsWith("/meeting/") && !isSignedIn)
    if (!showSidebar) {
        return <div className='min-h-screen'>{children}</div>
    }
    return (
        <SidebarProvider>

        </SidebarProvider>
    )
}

export default ConditionalLayout
