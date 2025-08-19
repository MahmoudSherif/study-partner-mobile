import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Trophy, Target, Clock, Flame, Calendar, TrendingUp } from '@phosphor-icons/react'
import { UserStats, Achievement, StudySession } from '@/lib/types'
import { formatTime } from '@/lib/utils'
import { getWeeklyData, getBestStudyTime } from '@/lib/chartUtils'
import { ActivityGrid } from '@/components/ActivityGrid'

interface ProfileTabProps {
  stats: UserStats
  achievements: Achievement[]
  sessions?: StudySession[]
}

export function ProfileTab({ stats, achievements, sessions = [] }: ProfileTabProps) {
  const unlockedAchievements = achievements.filter(a => a.unlocked)
  const nextAchievement = achievements.find(a => !a.unlocked && a.progress > 0)
  
  // Calculate weekly progress
  const weeklyData = getWeeklyData(sessions)
  const thisWeekMinutes = weeklyData[weeklyData.length - 1]?.minutes || 0
  const lastWeekMinutes = weeklyData[weeklyData.length - 2]?.minutes || 0
  const weeklyProgress = lastWeekMinutes > 0 ? ((thisWeekMinutes - lastWeekMinutes) / lastWeekMinutes) * 100 : 0
  
  // Get best study time
  const bestTime = getBestStudyTime(sessions)
  const bestTimeString = bestTime.sessions > 0 ? 
    `${bestTime.hour === 0 ? 12 : bestTime.hour > 12 ? bestTime.hour - 12 : bestTime.hour}${bestTime.hour >= 12 ? 'PM' : 'AM'}` 
    : 'N/A'

  return (
    <div className="space-y-4">
      {/* Activity Grid - GitHub-style contribution calendar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-white">Study Activity</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ActivityGrid sessions={sessions} />
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Clock size={24} className="mx-auto text-primary mb-2" />
            <div className="text-2xl font-bold text-white">{formatTime(stats.totalStudyTime)}</div>
            <div className="text-sm text-white/70">Total Study Time</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Flame size={24} className="mx-auto text-accent mb-2" />
            <div className="text-2xl font-bold text-white">{stats.streak}</div>
            <div className="text-sm text-white/70">Day Streak</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Target size={24} className="mx-auto text-primary mb-2" />
            <div className="text-2xl font-bold text-white">{stats.sessionsCompleted}</div>
            <div className="text-sm text-white/70">Sessions</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Trophy size={24} className="mx-auto text-accent mb-2" />
            <div className="text-2xl font-bold text-white">{unlockedAchievements.length}</div>
            <div className="text-sm text-white/70">Achievements</div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress and Best Time */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar size={24} className="mx-auto text-primary mb-2" />
            <div className="text-2xl font-bold text-white">{formatTime(thisWeekMinutes)}</div>
            <div className="text-sm text-white/70">This Week</div>
            {weeklyProgress !== 0 && (
              <div className={`text-xs mt-1 ${weeklyProgress > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {weeklyProgress > 0 ? '+' : ''}{Math.round(weeklyProgress)}% vs last week
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp size={24} className="mx-auto text-accent mb-2" />
            <div className="text-2xl font-bold text-white">{bestTimeString}</div>
            <div className="text-sm text-white/70">Best Study Time</div>
            {bestTime.sessions > 0 && (
              <div className="text-xs text-white/50 mt-1">
                {bestTime.sessions} sessions at this hour
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {nextAchievement && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-white">Next Achievement</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-2xl">{nextAchievement.icon}</span>
              <div>
                <h3 className="font-medium text-white">{nextAchievement.title}</h3>
                <p className="text-sm text-white/70">{nextAchievement.description}</p>
              </div>
            </div>
            <Progress 
              value={(nextAchievement.progress / nextAchievement.requirement) * 100} 
              className="h-2"
            />
            <div className="text-xs text-white/50 mt-1 text-right">
              {nextAchievement.progress} / {nextAchievement.requirement}
            </div>
          </CardContent>
        </Card>
      )}

      {unlockedAchievements.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-white">Recent Achievements</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {unlockedAchievements.slice(-3).map((achievement) => (
                <div key={achievement.id} className="flex items-center space-x-3">
                  <span className="text-xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-white">{achievement.title}</h4>
                    <p className="text-xs text-white/70">{achievement.description}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                    Unlocked
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}