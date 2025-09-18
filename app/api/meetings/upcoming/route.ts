import { prisma } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"


export async function GET() {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
        }
        const user = await prisma.user.findUnique({
            where: {
                clerkId: userId
            }
        })
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }
        const now = new Date()
        const upcomingMeetings = await prisma.meeting.findMany({
            where: {
                userId: user.id,
                startTime: { gte: now },
                isFromCalendar: true
            },
            orderBy: {
                startTime: "asc",
            },
            take: 10
        })

        const events = upcomingMeetings.map(meeting => ({
            id: meeting.calendarEventId || meeting.id,
            summary: meeting.title,
            start: { dateTime: meeting.startTime.toISOString() },
            end: { dateTime: meeting.endTime.toISOString() },
            attendees: meeting.attendees ? JSON.parse(meeting.attendees as string) : [],
            hangoutLink: meeting.meetingUrl,
            botScheduled: meeting.botScheduled,
            meetingId: meeting.id,
            conferenceData: meeting.meetingUrl ? { entryPoints: [{ uri: meeting.meetingUrl }] } : null,
        }))

        return NextResponse.json({
            events,
            connected: user.calendarConnected,
            source: "database"
        })
        


    } catch (error) {
        console.log("🚀 ~ GET ~ error:", error)
        return NextResponse.json({
            error: "Failed to fetch meetings",
            events: [],
            connected: false
        }, { status: 500 })
    }

}