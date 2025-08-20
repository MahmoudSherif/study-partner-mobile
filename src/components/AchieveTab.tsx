import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Pause, 
  Square, 
  Plus, 
  Target, 
  Clock, 
  Trophy,
  Edit2,
  Trash2,
  CheckCircle
} from '@phosphor-icons/react'
import { FocusSession, Goal, Achievement } from '@/lib/types'
import { toast } from 'sonner'
import { mobileFeedback } from '@/lib/mobileFeedback'
import { notificationManager } from '@/lib/notifications'

interface AchieveTabProps {
  achievements: Achievement[]
  onUpdateAchievements: (achievements: Achievement[]) => void
}

export function AchieveTab({ achievements, onUpdateAchievements }: AchieveTabProps) {
  const [focusSessions, setFocusSessions] = useKV<FocusSession[]>('focus-sessions', [])
  const [goals, setGoals] = useKV<Goal[]>('focus-goals', [])
  
  // Timer state
  const [isRunning, setIsRunning] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [sessionTitle, setSessionTitle] = useState('')
  const [sessionCategory, setSessionCategory] = useState('')
  const [sessionNotes, setSessionNotes] = useState('')
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null)
  
  // UI state
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [showEditGoal, setShowEditGoal] = useState<Goal | null>(null)
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target: 60,
    category: 'daily' as Goal['category'],
    deadline: ''
  })

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isRunning && currentSession) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 1)
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, currentSession])

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  // Start focus session
  const startSession = () => {
    if (!sessionTitle.trim()) {
      toast.error('Please enter a focus title')
      return
    }

    const newSession: FocusSession = {
      id: Date.now().toString(),
      title: sessionTitle.trim(),
      duration: 0,
      startTime: new Date(),
      completed: false,
      category: sessionCategory || undefined,
      notes: sessionNotes || undefined
    }

    setCurrentSession(newSession)
    setCurrentTime(0)
    setIsRunning(true)
    mobileFeedback.buttonPress()
    toast.success(`Focus session started: ${sessionTitle}`)
  }

  // Pause/resume session
  const togglePause = () => {
    setIsRunning(!isRunning)
    mobileFeedback.buttonPress()
  }

  // Stop and save session
  const stopSession = () => {
    if (!currentSession) return

    const sessionMinutes = Math.floor(currentTime / 60)
    const completedSession: FocusSession = {
      ...currentSession,
      duration: sessionMinutes, // store in minutes
      endTime: new Date(),
      completed: true
    }

    console.log('Saving focus session:', {
      title: completedSession.title,
      duration: completedSession.duration,
      startTime: completedSession.startTime,
      endTime: completedSession.endTime,
      currentTime: currentTime
    })

    // Save session
    setFocusSessions(current => {
      const updated = [...current, completedSession]
      console.log('Updated focus sessions:', updated)
      return updated
    })
    
    // Update goals progress
    updateGoalsProgress(sessionMinutes).catch(error => {
      console.error('Error updating goals progress:', error)
    })

    // Reset timer state
    setCurrentSession(null)
    setCurrentTime(0)
    setIsRunning(false)
    setSessionTitle('')
    setSessionCategory('')
    setSessionNotes('')

    mobileFeedback.studySessionComplete()
    toast.success(`Focus session completed! ${sessionMinutes} minutes of focused work.`)
  }

  // Update goals progress with error handling
  const updateGoalsProgress = async (minutes: number) => {
    try {
      const today = new Date()
      const updatedGoals = goals.map(goal => {
        let shouldUpdate = false
        
        if (goal.category === 'daily') {
          // Check if goal is for today
          const goalDate = new Date(goal.createdAt)
          if (goalDate.toDateString() === today.toDateString()) {
            shouldUpdate = true
          }
        } else if (goal.category === 'weekly') {
          // Check if goal is for this week
          const startOfWeek = new Date(today)
          startOfWeek.setDate(today.getDate() - today.getDay())
          const goalDate = new Date(goal.createdAt)
          if (goalDate >= startOfWeek) {
            shouldUpdate = true
          }
        } else if (goal.category === 'monthly') {
          // Check if goal is for this month
          const goalDate = new Date(goal.createdAt)
          if (goalDate.getMonth() === today.getMonth() && goalDate.getFullYear() === today.getFullYear()) {
            shouldUpdate = true
          }
        } else {
          // Custom goals always get updated
          shouldUpdate = true
        }

        if (shouldUpdate && !goal.isCompleted) {
          const newCurrent = Math.min(goal.current + minutes, goal.target)
          const wasCompleted = goal.isCompleted
          const isNowCompleted = newCurrent >= goal.target

          if (!wasCompleted && isNowCompleted) {
            mobileFeedback.achievement()
            toast.success(`🎯 Goal completed: ${goal.title}!`)
            
            // Send push notification for goal achievement
            try {
              await notificationManager.notifyGoalAchievement(goal.title, goal.description)
            } catch (error) {
              console.error('Failed to send goal achievement notification:', error)
            }
            
            // Check for goal achievement milestone
            const completedGoalsCount = goals.filter(g => g.isCompleted).length + 1 // +1 for this newly completed goal
            const goalAchieverAchievement = achievements.find(a => a.id === 'goal-achiever')
            
            if (goalAchieverAchievement && !goalAchieverAchievement.unlocked && completedGoalsCount >= goalAchieverAchievement.requirement) {
              const updatedAchievements = achievements.map(achievement => {
                if (achievement.id === 'goal-achiever') {
                  return {
                    ...achievement,
                    progress: completedGoalsCount,
                    unlocked: true,
                    unlockedAt: new Date()
                  }
                }
                return achievement
              })
              
              onUpdateAchievements(updatedAchievements)
              mobileFeedback.achievement()
              toast.success(`Achievement Unlocked: ${goalAchieverAchievement.title}!`, {
                description: goalAchieverAchievement.description,
                duration: 5000
              })
              
              // Send push notification for achievement unlock
              try {
                await notificationManager.notifyAchievementUnlock(
                  goalAchieverAchievement.title,
                  goalAchieverAchievement.description
                )
              } catch (error) {
                console.error('Failed to send achievement notification:', error)
              }
            }
          }

          return {
            ...goal,
            current: newCurrent,
            isCompleted: isNowCompleted
          }
        }
        
        return goal
      })

      setGoals(updatedGoals)
    } catch (error) {
      console.error('Error updating goals progress:', error)
      // Don't show user error, just log it
    }
  }

  // Add new goal
  const addGoal = async () => {
    if (!newGoal.title.trim()) {
      toast.error('Please enter a goal title')
      return
    }

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title.trim(),
      description: newGoal.description || undefined,
      target: newGoal.target,
      current: 0,
      deadline: newGoal.deadline ? new Date(newGoal.deadline) : undefined,
      category: newGoal.category,
      isCompleted: false,
      createdAt: new Date()
    }

    setGoals(current => [...current, goal])
    
    // Trigger achievement check for goal creation
    const updatedAchievements = achievements.map(achievement => {
      if (achievement.id === 'goal-setter' && !achievement.unlocked) {
        const newProgress = goals.length + 1 // +1 for the goal we just added
        const unlocked = newProgress >= achievement.requirement
        
        if (unlocked) {
          mobileFeedback.achievement()
          toast.success(`Achievement Unlocked: ${achievement.title}!`, {
            description: achievement.description,
            duration: 5000
          })
          
          // Send push notification for achievement unlock
          try {
            await notificationManager.notifyAchievementUnlock(
              achievement.title,
              achievement.description
            )
          } catch (error) {
            console.error('Failed to send achievement notification:', error)
          }
        }
        
        return {
          ...achievement,
          progress: Math.min(newProgress, achievement.requirement),
          unlocked,
          unlockedAt: unlocked ? new Date() : achievement.unlockedAt
        }
      }
      return achievement
    })
    
    onUpdateAchievements(updatedAchievements)
    
    setNewGoal({
      title: '',
      description: '',
      target: 60,
      category: 'daily',
      deadline: ''
    })
    setShowAddGoal(false)
    toast.success('Goal added successfully!')
  }

  // Delete goal
  const deleteGoal = (goalId: string) => {
    setGoals(current => current.filter(g => g.id !== goalId))
    toast.success('Goal deleted')
  }

  // Get active goals
  const activeGoals = goals.filter(goal => !goal.isCompleted).slice(0, 3)
  const completedGoals = goals.filter(goal => goal.isCompleted)

  return (
    <div className="space-y-6">
      {/* Goals Progress Bar */}
      <Card className="bg-black/40 backdrop-blur-md border-white/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Target size={20} />
            Current Goals
            {goals.length > 0 && (
              <Badge variant="secondary" className="bg-white/20 text-white ml-auto">
                {goals.filter(g => g.isCompleted).length}/{goals.length} completed
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeGoals.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-white/60 mb-3">No active goals yet</p>
              <p className="text-xs text-white/50 mb-3">
                Setting goals helps unlock achievements and track your progress!
              </p>
              <Button 
                onClick={() => setShowAddGoal(true)}
                className="bg-accent/20 hover:bg-accent/30 text-accent border-accent/30"
              >
                <Plus size={16} className="mr-2" />
                Add Your First Goal
              </Button>
            </div>
          ) : (
            <>
              {activeGoals.map(goal => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{goal.title}</h4>
                      <p className="text-white/60 text-sm">
                        {goal.current}/{goal.target} minutes • {goal.category}
                        {goal.deadline && (
                          <span className="ml-2">
                            Due: {new Date(goal.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteGoal(goal.id)}
                      className="text-white/60 hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  <Progress 
                    value={(goal.current / goal.target) * 100} 
                    className="h-2 bg-white/10"
                  />
                </div>
              ))}
              
              <Button 
                onClick={() => setShowAddGoal(true)}
                variant="outline"
                className="w-full bg-white/5 hover:bg-white/10 text-white border-white/20"
              >
                <Plus size={16} className="mr-2" />
                Add Goal
              </Button>
            </>
          )}
          
          {/* Quick Goal Templates */}
          {activeGoals.length === 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-white/50 mb-3">Quick Templates:</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { title: 'Study 2 hours today', target: 120, category: 'daily' as const },
                  { title: 'Focus for 1 hour', target: 60, category: 'daily' as const },
                  { title: '10 hours this week', target: 600, category: 'weekly' as const },
                  { title: 'Monthly reading goal', target: 1200, category: 'monthly' as const }
                ].map((template, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNewGoal({
                        title: template.title,
                        description: '',
                        target: template.target,
                        category: template.category,
                        deadline: ''
                      })
                      setShowAddGoal(true)
                    }}
                    className="text-xs bg-white/5 hover:bg-white/10 text-white/80 border-white/20"
                  >
                    {template.title}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Focus Timer */}
      <Card className="bg-black/40 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock size={20} />
            Focus Session
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!currentSession ? (
            <div className="space-y-4">
              <Input
                placeholder="What are you focusing on?"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              
              <Input
                placeholder="Category (optional)"
                value={sessionCategory}
                onChange={(e) => setSessionCategory(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              
              <Textarea
                placeholder="Session notes (optional)"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none h-20"
              />
              
              <Button 
                onClick={startSession}
                className="w-full bg-accent hover:bg-accent/80 text-accent-foreground"
                disabled={!sessionTitle.trim()}
              >
                <Play size={16} className="mr-2" />
                Start Focus Session
              </Button>
              
              {/* Quick Test Button for 1-minute session */}
              <Button 
                onClick={() => {
                  // Auto-start and complete a 1-minute session for testing
                  const testSession: FocusSession = {
                    id: Date.now().toString(),
                    title: 'Test Focus Session - 1 minute',
                    duration: 1, // 1 minute
                    startTime: new Date(),
                    endTime: new Date(),
                    completed: true,
                    category: 'test'
                  }
                  
                  setFocusSessions(current => {
                    const updated = [...current, testSession]
                    console.log('Added test focus session:', testSession)
                    console.log('All focus sessions now:', updated)
                    return updated
                  })
                  
                  toast.success('Test 1-minute focus session added! Check your Profile > Activity tab.')
                }}
                variant="outline"
                className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/30"
              >
                🧪 Add Test 1-min Session
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">{currentSession.title}</h3>
                {currentSession.category && (
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {currentSession.category}
                  </Badge>
                )}
              </div>
              
              <div className="text-6xl font-mono font-bold text-accent">
                {formatTime(currentTime)}
              </div>
              
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={togglePause}
                  variant="outline"
                  size="lg"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30"
                >
                  {isRunning ? <Pause size={20} /> : <Play size={20} />}
                </Button>
                
                <Button
                  onClick={stopSession}
                  variant="outline"
                  size="lg"
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30"
                >
                  <Square size={20} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card className="bg-black/40 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy size={20} />
            Achievement Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {achievements
              .filter(achievement => achievement.category === 'goals' || achievement.category === 'focus' || !achievement.unlocked)
              .slice(0, 4)
              .map(achievement => (
                <div
                  key={achievement.id}
                  className={`p-3 rounded-lg border transition-all ${
                    achievement.unlocked
                      ? 'bg-accent/20 border-accent/30'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {achievement.unlocked ? <CheckCircle className="text-accent" size={24} /> : achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium ${achievement.unlocked ? 'text-accent' : 'text-white'}`}>
                        {achievement.title}
                      </h4>
                      <p className="text-sm text-white/60">{achievement.description}</p>
                      {!achievement.unlocked && (
                        <>
                          <Progress 
                            value={(achievement.progress / achievement.requirement) * 100}
                            className="h-1 mt-2 bg-white/10"
                          />
                          <div className="text-xs text-white/60 mt-1">
                            {achievement.progress} / {achievement.requirement}
                            {achievement.category === 'goals' && ' goals'}
                            {achievement.category === 'focus' && ' focus sessions'}
                            {achievement.category === 'time' && ' minutes'}
                          </div>
                        </>
                      )}
                      {achievement.unlocked && achievement.unlockedAt && (
                        <div className="text-xs text-white/60 mt-1">
                          Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
          
          {/* Goal Achievement Stats */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-accent">{goals.filter(g => g.isCompleted).length}</div>
                <div className="text-xs text-white/60">Goals Completed</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-accent">{focusSessions.filter(fs => fs.completed).length}</div>
                <div className="text-xs text-white/60">Focus Sessions</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Goal Dialog */}
      <Dialog open={showAddGoal} onOpenChange={setShowAddGoal}>
        <DialogContent className="bg-black/90 backdrop-blur-md border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Goal title"
              value={newGoal.title}
              onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
            
            <Textarea
              placeholder="Description (optional)"
              value={newGoal.description}
              onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none h-20"
            />
            
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Target (minutes)"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, target: parseInt(e.target.value) || 60 }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
              <div className="flex-1">
                <Select value={newGoal.category} onValueChange={(value: Goal['category']) => setNewGoal(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/20">
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Input
              type="date"
              placeholder="Deadline (optional)"
              value={newGoal.deadline}
              onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: e.target.value }))}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
            
            <div className="flex gap-2">
              <Button
                onClick={() => setShowAddGoal(false)}
                variant="outline"
                className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/30"
              >
                Cancel
              </Button>
              <Button
                onClick={addGoal}
                className="flex-1 bg-accent hover:bg-accent/80 text-accent-foreground"
              >
                Add Goal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}