"use client"

import { useAuth } from "@clerk/nextjs"
import { createContext, ReactNode, useState } from "react"

interface PlanLimits {
    meetings: number
    chatMessages: number
}

interface UsageData {
    currentPlan: string
    subscriptionStatus: string
    meetingsThisMonth: number
    chatMessagesToday: number
    billingPeriodStart: string | null
}

interface UsageContextType {
    usage: UsageData | null
    loading: boolean
    canChat: boolean
    canScheduleMeeting: boolean
    limits: PlanLimits
    incrementChatUsage: () => Promise<void>
    incrementMeetingUsage: () => Promise<void>
    refreshUsage: () => Promise<void>
}

const PLAN_LIMITS: Record<string, PlanLimits> = {
    free: { meetings: 0, chatMessages: 0 },
    starter: { meetings: 10, chatMessages: 30 },
    pro: { meetings: 30, chatMessages: 100 },
    premium: { meetings: -1, chatMessages: -1 }
}

const usageContext = createContext<UsageContextType | undefined>(undefined)

export function UsageProvide({ children }: { children: ReactNode }) {
    const { userId, isLoaded } = useAuth()
    const [usage, setUsage] = useState<UsageData | null>(null)
    const [loading, setLoading] = useState(true);

    const limits = usage ? PLAN_LIMITS[usage.currentPlan] || PLAN_LIMITS.free : PLAN_LIMITS.free

    const canChat = usage ? (
        usage.currentPlan !== "free" && usage.subscriptionStatus === "active" && (limits.meetings == -1 || usage.meetingsThisMonth < limits.chatMessages)
    ) : false

    const chatScheduleMeeting = usage ? (
        usage.currentPlan !== 'free' &&
        usage.subscriptionStatus === 'active' &&
        (limits.meetings === -1 || usage.meetingsThisMonth < limits.meetings)
    ) : false

    const fetchUsage = async () => {
        if (!userId) return
        try {
            const response = await fetch('/api/user/usage')
            if (response.ok) {
                const data = await response.json()
                setUsage(data)
            }
        } catch (error) {
            console.log("🚀 ~ fetchUsage ~ error:", error)
        } finally {
            setLoading(false)
        }
    }

    const incrementChatUsage = async () => {
        if (!canChat) {
            return
        }
        try {
            const response = await fetch("/api/user/increment-chat", {
                method: 'POST',
                headers: { 'Content-type': 'application/json' }
            })
            if (response.ok) {
                setUsage(prev => prev ? { ...prev, chatMessagesToday: prev.chatMessagesToday + 1 } : null)
            } else {
                const data = await response.json()
                if (data.upgradeRequired) {
                    console.log(data.error)
                }
            }
        } catch (error) {
            console.log("🚀 ~ incrementChatUsage ~ error:", error)
        }
    }
}

