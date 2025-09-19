import { prisma } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"
import { error } from "console"
import { NextResponse } from "next/server"


export async function POST(request: Request, { params }: { params: { meetingId: string } }) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
        }
        const { botScheduled } = await request.json()
        const { meetingId } = await params

        const user = await prisma.user.findUnique({
            where: {
                clerkId: userId
            }
        })

        if (!user) {
            return NextResponse.json({ error: "user not found" }, { status: 404 })
        }

        const meeting = await prisma.meeting.update({
            where: {
                id: meetingId,
                userId: user.id
            },
            data: {
                botScheduled: botScheduled
            }
        })
        if (!meeting) {
            return NextResponse.json({ error: 'meeting not found' }, { status: 404 })
        }
        return NextResponse.json({ success: true, botScheduled: meeting.botScheduled, message: `Bot ${botScheduled ? "enable" : "disabled"} for meeting` })
    } catch (error) {
        console.log("🚀 ~ POST ~ error:", error)
        return NextResponse.json({
            error: "Failed to update bot status"
        }, { status: 500 })

    }

    

}