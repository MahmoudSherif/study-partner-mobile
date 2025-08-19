import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Trophy, Target, Clock, Flame } from '@phosphor-icons/react'
import { UserStats, Achievement } from '@/lib/types'
import { formatTime } from '@/lib/utils'

interface StatsOverviewProps {
  stats: UserStats
  achievements: Achievement[]
}

export function StatsOverview({ stats, achievements }: StatsOverviewProps) {
  const unlockedAchievements = achievements.filter(a => a.unlocked)
  const nextAchievement = achievements.find(a => !a.unlocked && a.progress > 0)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Clock size={24} className="mx-auto text-primary mb-2" />
            <div className="text-2xl font-bold">{formatTime(stats.totalStudyTime)}</div>
            <div className="text-sm text-muted-foreground">Total Study Time</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Flame size={24} className="mx-auto text-accent mb-2" />
            <div className="text-2xl font-bold">{stats.streak}</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Target size={24} className="mx-auto text-primary mb-2" />
            <div className="text-2xl font-bold">{stats.sessionsCompleted}</div>
            <div className="text-sm text-muted-foreground">Sessions</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Trophy size={24} className="mx-auto text-accent mb-2" />
            <div className="text-2xl font-bold">{unlockedAchievements.length}</div>
            <div className="text-sm text-muted-foreground">Achievements</div>
          </CardContent>
        </Card>
      </div>

      {nextAchievement && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Next Achievement</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-2xl">{nextAchievement.icon}</span>
              <div>
                <h3 className="font-medium">{nextAchievement.title}</h3>
                <p className="text-sm text-muted-foreground">{nextAchievement.description}</p>
              </div>
            </div>
            <Progress 
              value={(nextAchievement.progress / nextAchievement.requirement) * 100} 
              className="h-2"
            />
            <div className="text-xs text-muted-foreground mt-1 text-right">
              {nextAchievement.progress} / {nextAchievement.requirement}
            </div>
          </CardContent>
        </Card>
      )}

      {unlockedAchievements.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Achievements</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {unlockedAchievements.slice(-3).map((achievement) => (
                <div key={achievement.id} className="flex items-center space-x-3">
                  <span className="text-xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{achievement.title}</h4>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
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