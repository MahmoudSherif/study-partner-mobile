import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Achievement } from '@/lib/types'

interface AchievementsProps {
  achievements: Achievement[]
}

export function Achievements({ achievements }: AchievementsProps) {
  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalCount = achievements.length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Achievements</h2>
        <Badge variant="secondary">
          {unlockedCount} / {totalCount}
        </Badge>
      </div>

      <div className="space-y-3">
        {achievements.map((achievement) => (
          <Card 
            key={achievement.id}
            className={achievement.unlocked ? 'bg-accent/10 border-accent/20' : 'opacity-60'}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="text-3xl">
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium">{achievement.title}</h3>
                    {achievement.unlocked && (
                      <Badge className="bg-accent text-accent-foreground">
                        Unlocked!
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {achievement.description}
                  </p>
                  {!achievement.unlocked && (
                    <>
                      <Progress 
                        value={(achievement.progress / achievement.requirement) * 100} 
                        className="h-2 mb-1"
                      />
                      <div className="text-xs text-muted-foreground">
                        {achievement.progress} / {achievement.requirement}
                      </div>
                    </>
                  )}
                  {achievement.unlocked && achievement.unlockedAt && (
                    <div className="text-xs text-muted-foreground">
                      Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}