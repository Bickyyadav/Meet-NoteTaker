/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAuth } from "@clerk/nextjs"
import { useEffect, useState } from "react"

export interface CalendarEvent {
    id: string
    summary?: string
    start: {
        dateTime?: string
        date?: string
    },
    attendees?: Array<{ email: string }>
    location?: string
    hangoutLink?: string
    conferenceData?: any
    botScheduled?: boolean
    meetingId?: string
}

export interface PastMeeting {
    id: string
    title: string
    description?: string | null
    meetingUrl: string | null
    startTime: Date
    endTime: Date
    attendees?: any
    transcriptReady: boolean
    recordingUrl?: string | null
    speakers?: any
}

export function useMeeting() {
    const { userId } = useAuth()
    const [upcommingEvents, setupcommingEvents] = useState<CalendarEvent[]>([])
    const [PastMeeting, setPastMeeting] = useState<PastMeeting[]>([])
    const [loading, setLoading] = useState(false)
    const [pastLoading, setPastLoading] = useState(false)
    const [connected, setConnected] = useState(false)
    const [error, setError] = useState<string>('')
    const [initialLoading, setInitialLoading] = useState(true)
    const [botToggles, setBotToggles] = useState<{ [key: string]: boolean }>({})

    useEffect(() => {
        if (userId) {
            fetchUpcomingEvents()
            fetchPastMeetings()
        }
    }, [userId])

    const fetchUpcomingEvents = async () => {
        setLoading(true)
        setError("")

        try {
            const statusResponse = await fetch("/api/user/calendar-status")
            const statusData = await statusResponse.json()
            if (!statusData.connected) {
                setConnected(false)
                setupcommingEvents([])
                setError('Calendar not connected for auto-sync. Connect to enable auto syncing.')
                setLoading(false)
                setInitialLoading(false)
                return
            }

            const response = await fetch("/api/meetings/upcoming")
            console.log("🚀 ~ fetchUpcomingEvents ~ response:", response)
            const result = await response.json()
            if (!response.ok) {
                setError(result.error || 'Failed to fetch meetings')
                setConnected(false)
                setInitialLoading(false)
                return
            }
            setupcommingEvents(result.events as CalendarEvent[])
            setConnected(result.connected)
            const toggles: { [Key: string]: boolean } = {}
            result.events.forEach((event: CalendarEvent) => {
                toggles[event.id] = event.botScheduled ?? true
            })

            setBotToggles(toggles)

        } catch (error) {
            setError("failed to fetch calnedar events. please try agan")
            setConnected(false)
        }
        setLoading(false)
        setInitialLoading(false)
    }


    const fetchPastMeetings = async () => {
        setPastLoading(true)
        try {
            const response = await fetch("/api/meetings/past")
            const result = await response.json()
            if (!response.ok) {
                console.error('faild to fetch past meetings:', result.error)
                return
            }
            if (result.error) {
                return
            }
            setPastMeeting(result.meetings as PastMeeting[])
        } catch (error) {
            console.log("🚀 ~ fetchPastMeetings ~ error:", error)

        }
        setPastLoading(false)
    }

    const toggleBot = async (eventId: string) => {
        try {
            const event = upcommingEvents.find((e) => { e.id === eventId })
            if (!event?.meetingId) {
                return
            }
            setBotToggles(prev => ({ ...prev, [eventId]: !prev[eventId] }))
            const response = await fetch(`/api/meetings/${event.meetingId}/bot-toggle`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    botScheduled: !botToggles[eventId]
                })
            })
            if (!response.ok) {
                setBotToggles(prev => ({
                    ...prev,
                    [eventId]: !prev[eventId]
                }))
            }

        } catch (error) {
            console.log("🚀 ~ toggleBot ~ error:", error)
            setBotToggles(prev => ({
                ...prev,
                [eventId]: !prev[eventId]
            }))

        }
    }

    const directOAuth = async () => {
        setLoading(true)
        try {
            window.location.href = '/api/auth/google/direct-connect'
        } catch (error) {
            setError('Failed to start direct OAuth')
            setLoading(false)

        }
    }


    const getAttendeeList = (attendees: any): string[] => {
        if (!attendees) {
            return []
        }
        try {
            const parsed = JSON.parse(String(attendees))
            if (Array.isArray(parsed)) {
                return parsed.map(name => String(name).trim())
            }
            return [String(parsed).trim()]
        } catch (error) {
            console.log("🚀 ~ getAttendeeList ~ error:", error)
            const attendeeString = String(attendees)
            return attendeeString.split(',').map(name => name.trim()).filter(Boolean)

        }
    }

    //if we pass the name bicky then you will get b only not other
    const getInitials = (name: string): string => {
        return name.split(" ").map(word => word.charAt(0)).join("").toUpperCase().slice(0, 2)
    }

    return {
        userId,
        upcommingEvents,
        PastMeeting,
        loading,
        pastLoading,
        connected,
        error,
        botToggles,
        initialLoading,
        fetchUpcomingEvents,
        fetchPastMeetings,
        toggleBot,
        directOAuth,
        getAttendeeList,
        getInitials
    }
     

}