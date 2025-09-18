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
    const [PastMeeting, setPastMetting] = useState<PastMeeting[]>([])
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
            const result = await response.json()
            if (!response.ok) {
                setError(result.error || 'Failed to fetch meetings')
                setConnected(false)
                setInitialLoading(false)
                return
            }
            

        } catch (error) {
            setError("failed to fetch calnedar events. please try agan")
            setConnected(false)
        }
        setLoading(false)
        setInitialLoading(false)
    }

}