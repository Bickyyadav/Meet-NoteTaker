import { prisma } from "@/lib/db"
import { incrementMeetingUsage } from "@/lib/usage"
import { auth } from "@clerk/nextjs/server"
import { error } from "console"
import { NextResponse } from "next/server"


export async function POST() {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: "Not authed" }, { status: 401 })
        }
        const user = await prisma.user.findUnique({
            where: {
                clerkId: userId
            },
            select: {
                id: true
            }
        })
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        await incrementMeetingUsage(user.id)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.log("🚀 ~ POST ~ error:", error)
        return NextResponse.json({ error: 'failed to incrmeent usage' }, { status: 500 })
    }

}