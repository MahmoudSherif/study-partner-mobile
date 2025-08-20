import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StudySession } from '@/lib/types'
import { Calendar, TrendingUp } from '@phosphor-icons/react'
import { useMemo } from 'react'

interface ActivityChartsProps {
  sessions: StudySession[]
}

export function ActivityCharts({ sessions }: ActivityChartsProps) {
  // Calculate weekly activity data (last 4 weeks)
  const weeklyData = useMemo(() => {
    const now = new Date()
    const weeks = []
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now)
      weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + 7 * i))
      weekStart.setHours(0, 0, 0, 0)
      
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)
      
      const weekSessions = sessions.filter(session => {
        const sessionDate = new Date(session.startTime)
        return sessionDate >= weekStart && sessionDate <= weekEnd
      })
      
      const totalMinutes = weekSessions.reduce((sum, session) => sum + session.duration, 0)
      const sessionCount = weekSessions.length
      
      // Calculate relative height (0-100 scale)
      const maxHeight = 100
      const height = Math.min(maxHeight, Math.max(8, (totalMinutes / 60) * 10)) // Scale based on hours
      
      weeks.push({
        label: i === 0 ? 'This week' : i === 1 ? 'Last week' : `${i + 1} weeks ago`,
        shortLabel: `W${4 - i}`,
        minutes: totalMinutes,
        sessions: sessionCount,
        height
      })
    }
    
    return weeks
  }, [sessions])

  // Calculate monthly activity data (last 6 months)
  const monthlyData = useMemo(() => {
    const now = new Date()
    const months = []
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999)
      
      const monthSessions = sessions.filter(session => {
        const sessionDate = new Date(session.startTime)
        return sessionDate >= monthStart && sessionDate <= monthEnd
      })
      
      const totalMinutes = monthSessions.reduce((sum, session) => sum + session.duration, 0)
      const sessionCount = monthSessions.length
      
      // Calculate relative height (0-100 scale)
      const maxHeight = 100
      const height = Math.min(maxHeight, Math.max(8, (totalMinutes / 120) * 10)) // Scale based on 2-hour units
      
      const monthName = monthDate.toLocaleDateString('en', { month: 'short' })
      
      months.push({
        label: i === 0 ? 'This month' : `${monthName} ${monthDate.getFullYear()}`,
        shortLabel: monthName,
        minutes: totalMinutes,
        sessions: sessionCount,
        height
      })
    }
    
    return months
  }, [sessions])

  // Function to format time
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-white">Activity Charts</CardTitle>
        <p className="text-sm text-white/70">
          Your study patterns over time
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-sm">
            <TabsTrigger value="weekly" className="text-xs text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
              <Calendar size={16} className="mr-1" />
              Weekly
            </TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
              <TrendingUp size={16} className="mr-1" />
              Monthly
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="space-y-4 mt-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-white">Weekly Activity (Last 4 weeks)</h4>
              <div className="flex items-end justify-between gap-2 h-32 bg-black/20 rounded-lg p-4">
                {weeklyData.map((week, index) => (
                  <div key={index} className="flex flex-col items-center gap-2 flex-1">
                    <div 
                      className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t-sm transition-all duration-300 hover:from-primary/80 hover:to-primary/40 cursor-pointer relative group"
                      style={{ height: `${week.height}%` }}
                      title={`${week.label}: ${formatTime(week.minutes)} (${week.sessions} sessions)`}
                    >
                      {/* Tooltip content - shown on hover */}
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {formatTime(week.minutes)}
                      </div>
                    </div>
                    <div className="text-xs text-white/70 text-center">
                      {week.shortLabel}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Weekly Summary */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-black/20 rounded-lg p-3">
                  <div className="text-white/70">This Week</div>
                  <div className="text-white font-medium">
                    {formatTime(weeklyData[3]?.minutes || 0)}
                  </div>
                  <div className="text-white/50">
                    {weeklyData[3]?.sessions || 0} sessions
                  </div>
                </div>
                <div className="bg-black/20 rounded-lg p-3">
                  <div className="text-white/70">Weekly Average</div>
                  <div className="text-white font-medium">
                    {formatTime(Math.round(weeklyData.reduce((sum, week) => sum + week.minutes, 0) / 4))}
                  </div>
                  <div className="text-white/50">
                    {Math.round(weeklyData.reduce((sum, week) => sum + week.sessions, 0) / 4)} sessions
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4 mt-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-white">Monthly Activity (Last 6 months)</h4>
              <div className="flex items-end justify-between gap-2 h-32 bg-black/20 rounded-lg p-4">
                {monthlyData.map((month, index) => (
                  <div key={index} className="flex flex-col items-center gap-2 flex-1">
                    <div 
                      className="w-full bg-gradient-to-t from-accent to-accent/60 rounded-t-sm transition-all duration-300 hover:from-accent/80 hover:to-accent/40 cursor-pointer relative group"
                      style={{ height: `${month.height}%` }}
                      title={`${month.label}: ${formatTime(month.minutes)} (${month.sessions} sessions)`}
                    >
                      {/* Tooltip content - shown on hover */}
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {formatTime(month.minutes)}
                      </div>
                    </div>
                    <div className="text-xs text-white/70 text-center">
                      {month.shortLabel}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Monthly Summary */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-black/20 rounded-lg p-3">
                  <div className="text-white/70">This Month</div>
                  <div className="text-white font-medium">
                    {formatTime(monthlyData[5]?.minutes || 0)}
                  </div>
                  <div className="text-white/50">
                    {monthlyData[5]?.sessions || 0} sessions
                  </div>
                </div>
                <div className="bg-black/20 rounded-lg p-3">
                  <div className="text-white/70">Monthly Average</div>
                  <div className="text-white font-medium">
                    {formatTime(Math.round(monthlyData.reduce((sum, month) => sum + month.minutes, 0) / 6))}
                  </div>
                  <div className="text-white/50">
                    {Math.round(monthlyData.reduce((sum, month) => sum + month.sessions, 0) / 6)} sessions
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}