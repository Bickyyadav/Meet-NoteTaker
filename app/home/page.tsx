"use client"
import React from 'react'
import { useMeeting } from './hooks/useMeetings'
import { useRouter } from 'next/navigation'
import { PastMeetings } from "./components/PastMeetings"
import UpcomingMeetings from './components/UpcomingMeetings'

const Home = () => {
    const {
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
    } = useMeeting()
    const router = useRouter()
    const handleMeetingClick = (meetingId: string) => {
        router.push(`/meeting/${meetingId}`)
    }
    if (!userId) {
        return (
            <div className='flex items-center justify-center h-screen'>
                Loading...
            </div>
        )
    }
    return (
        <div className='min-h-screen bg-background'>
            <div className='flex p-6 gap-6'>
                <div className='flex-1'>
                    <div className='mb-6'>
                        <h2 className='text-2xl font-bold text-foreground'>
                            Past Meetings
                        </h2>
                    </div>
                    <PastMeetings
                        pastMeeting={PastMeeting}
                        pastLoading={pastLoading}
                        onMeetingClick={handleMeetingClick}
                        getAttendeeList={getAttendeeList}
                        getInitials={getInitials}
                    />
                </div>
                <div className='w-px bg-border'></div>

                <div className='w-96'>
                    <div className='sticky top-6'>
                        <UpcomingMeetings
                            upcomingEvents={upcommingEvents}
                            connected={connected}
                            error={error}
                            loading={loading}
                            initialLoading={initialLoading}
                            botToggles={botToggles}
                            onRefresh={fetchUpcomingEvents}
                            onToggleBot={toggleBot}
                            onConnectCalendar={directOAuth}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home
