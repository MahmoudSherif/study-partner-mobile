import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Timer } from '@/components/Timer'
import { SubjectManagement } from '@/components/SubjectManagement'
import { StatsOverview } from '@/components/StatsOverview'
import { ProgressCharts } from '@/components/ProgressCharts'
import { TargetProgress } from '@/components/TargetProgress'
import { TargetNotifications } from '@/components/TargetNotifications'
import { Achievements } from '@/components/Achievements'
import { SpaceBackground } from '@/components/SpaceBackground'
import { QuotesBar } from '@/components/QuotesBar'
import { Calendar } from '@/components/Calendar'
import { TasksManagement } from '@/components/TasksManagement'
import { TaskCelebration } from '@/components/TaskCelebration'
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'
import { DeviceIndicator } from '@/components/DeviceIndicator'
import { OfflineIndicator } from '@/components/OfflineIndicator'
import { HapticTestPanel } from '@/components/HapticTestPanel'
import { Subject, StudySession, Achievement, Task, Challenge, TaskProgress } from '@/lib/types'
import { INITIAL_ACHIEVEMENTS } from '@/lib/constants'
import { calculateUserStats, updateAchievements } from '@/lib/utils'
import { useTouchGestures } from '@/hooks/useTouchGestures'
import { usePWA } from '@/hooks/usePWA'
import { useMobileBehavior } from '@/hooks/useDeviceDetection'
import { mobileFeedback } from '@/lib/mobileFeedback'
import { 
  Clock, 
  ChartBar, 
  Trophy, 
  BookOpen, 
  Calendar as CalendarIcon,
  CheckSquare 
} from '@phosphor-icons/react'
import { toast, Toaster } from 'sonner'

function App() {
  const [subjects, setSubjects] = useKV<Subject[]>('study-subjects', [])
  const [sessions, setSessions] = useKV<StudySession[]>('study-sessions', [])
  const [achievements, setAchievements] = useKV<Achievement[]>('achievements', INITIAL_ACHIEVEMENTS)
  const [tasks, setTasks] = useKV<Task[]>('tasks', [])
  const [challenges, setChallenges] = useKV<Challenge[]>('challenges', [])
  const [currentTab, setCurrentTab] = useState('timer')
  
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false)
  const [lastSessionDuration, setLastSessionDuration] = useState(0)
  const [celebrationData, setCelebrationData] = useState<{
    isOpen: boolean
    taskTitle: string
    isChallenge: boolean
    challengeTitle?: string
    points?: number
  }>({
    isOpen: false,
    taskTitle: '',
    isChallenge: false
  })
  const [showChallengeProgress, setShowChallengeProgress] = useState(false)

  const stats = calculateUserStats(sessions)
  const { isStandalone } = usePWA()
  const deviceInfo = useMobileBehavior()
  
  // Get current user ID (mock for now)
  const currentUserId = 'user-1'

  // Touch gestures for tab navigation
  const containerRef = useTouchGestures({
    onSwipeLeft: () => {
      const tabs = ['timer', 'subjects', 'tasks', 'calendar', 'stats', 'achievements']
      const currentIndex = tabs.indexOf(currentTab)
      if (currentIndex < tabs.length - 1) {
        mobileFeedback.buttonPress()
        setCurrentTab(tabs[currentIndex + 1])
      }
    },
    onSwipeRight: () => {
      const tabs = ['timer', 'subjects', 'tasks', 'calendar', 'stats', 'achievements']
      const currentIndex = tabs.indexOf(currentTab)
      if (currentIndex > 0) {
        mobileFeedback.buttonPress()
        setCurrentTab(tabs[currentIndex - 1])
      }
    },
    threshold: 100
  })

  // Prevent zooming on double tap
  useEffect(() => {
    const preventDefault = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault()
      }
    }

    const preventZoom = (e: TouchEvent) => {
      const t2 = e.timeStamp
      const t1 = e.currentTarget.dataset.lastTouch || t2
      const dt = t2 - t1
      const fingers = e.touches.length
      e.currentTarget.dataset.lastTouch = t2.toString()

      if (!dt || dt > 500 || fingers > 1) return // not double-tap

      e.preventDefault()
      e.target.click()
    }

    document.addEventListener('touchstart', preventDefault, { passive: false })
    document.addEventListener('touchstart', preventZoom, { passive: false })

    return () => {
      document.removeEventListener('touchstart', preventDefault)
      document.removeEventListener('touchstart', preventZoom)
    }
  }, [])

  // Handle URL tab parameter for PWA shortcuts
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tabParam = urlParams.get('tab')
    if (tabParam && ['timer', 'subjects', 'tasks', 'calendar', 'stats', 'achievements'].includes(tabParam)) {
      setCurrentTab(tabParam)
    }
  }, [])

  // Calculate task progress
  const calculateTaskProgress = (): TaskProgress => {
    const today = new Date()
    const todayTasks = tasks.filter(task => {
      const taskDate = new Date(task.createdAt)
      return taskDate.toDateString() === today.toDateString()
    })
    
    const completedTodayTasks = todayTasks.filter(task => task.completed)
    
    const dailyProgress = {
      total: todayTasks.length,
      completed: completedTodayTasks.length,
      percentage: todayTasks.length > 0 ? (completedTodayTasks.length / todayTasks.length) * 100 : 0
    }

    // Find active challenge the user is participating in
    const activeChallenge = challenges.find(challenge => 
      challenge.isActive && challenge.participants.includes(currentUserId)
    )

    let challengeProgress = undefined
    if (activeChallenge && showChallengeProgress) {
      const userCompletedTasks = activeChallenge.tasks.filter(task => 
        task.completedBy.includes(currentUserId)
      ).length
      
      // Calculate user rank
      const participantScores = activeChallenge.participants.map(participantId => {
        return activeChallenge.tasks.filter(task => 
          task.completedBy.includes(participantId)
        ).length
      }).sort((a, b) => b - a)
      
      const userScore = userCompletedTasks
      const userRank = participantScores.findIndex(score => score === userScore) + 1

      challengeProgress = {
        challengeId: activeChallenge.id,
        challengeTitle: activeChallenge.title,
        totalTasks: activeChallenge.tasks.length,
        completedTasks: userCompletedTasks,
        percentage: activeChallenge.tasks.length > 0 ? (userCompletedTasks / activeChallenge.tasks.length) * 100 : 0,
        userRank,
        totalParticipants: activeChallenge.participants.length
      }
    }

    return {
      dailyTasks: dailyProgress,
      challengeProgress
    }
  }

  const taskProgress = calculateTaskProgress()

  // Track previous progress for milestone detection
  const [previousDailyProgress, setPreviousDailyProgress] = useState(0)
  const [previousChallengeProgress, setPreviousChallengeProgress] = useState(0)

  // Check for progress milestones and trigger haptic feedback
  useEffect(() => {
    const dailyPercentage = taskProgress.dailyTasks.percentage
    const challengePercentage = taskProgress.challengeProgress?.percentage || 0

    // Check daily task milestones (25%, 50%, 75%, 100%)
    const dailyMilestones = [25, 50, 75, 100]
    const reachedDailyMilestone = dailyMilestones.find(milestone => 
      dailyPercentage >= milestone && previousDailyProgress < milestone
    )

    if (reachedDailyMilestone && dailyPercentage > 0) {
      mobileFeedback.progressMilestone()
      toast.success(`Daily Progress: ${reachedDailyMilestone}% complete! 🎯`, {
        description: `${taskProgress.dailyTasks.completed}/${taskProgress.dailyTasks.total} tasks done today`,
      })
    }

    // Check challenge milestones
    const challengeMilestones = [25, 50, 75, 100]
    const reachedChallengeMilestone = challengeMilestones.find(milestone => 
      challengePercentage >= milestone && previousChallengeProgress < milestone
    )

    if (reachedChallengeMilestone && challengePercentage > 0 && taskProgress.challengeProgress) {
      mobileFeedback.progressMilestone()
      toast.success(`Challenge Progress: ${reachedChallengeMilestone}% complete! 🏆`, {
        description: `${taskProgress.challengeProgress.completedTasks}/${taskProgress.challengeProgress.totalTasks} tasks in ${taskProgress.challengeProgress.challengeTitle}`,
      })
    }

    setPreviousDailyProgress(dailyPercentage)
    setPreviousChallengeProgress(challengePercentage)
  }, [taskProgress.dailyTasks.percentage, taskProgress.challengeProgress?.percentage])

  useEffect(() => {
    const updatedAchievements = updateAchievements(achievements, stats, sessions)
    
    // Check for newly unlocked achievements
    const newlyUnlocked = updatedAchievements.filter((achievement, index) => 
      achievement.unlocked && !achievements[index]?.unlocked
    )
    
    if (newlyUnlocked.length > 0) {
      setAchievements(updatedAchievements)
      newlyUnlocked.forEach(achievement => {
        // Trigger achievement haptic feedback
        mobileFeedback.achievement()
        
        toast.success(`Achievement Unlocked: ${achievement.title}`, {
          description: achievement.description,
          duration: 5000
        })
      })
    } else {
      setAchievements(updatedAchievements)
    }
  }, [stats.totalStudyTime, stats.sessionsCompleted, stats.streak])

  const handleAddSubject = (subjectData: Omit<Subject, 'id'>) => {
    const newSubject: Subject = {
      ...subjectData,
      id: Date.now().toString()
    }
    setSubjects(current => [...current, newSubject])
    toast.success(`Added subject: ${newSubject.name}`)
  }

  const handleDeleteSubject = (id: string) => {
    const subject = subjects.find(s => s.id === id)
    setSubjects(current => current.filter(s => s.id !== id))
    setSessions(current => current.filter(s => s.subjectId !== id))
    
    if (selectedSubject?.id === id) {
      setSelectedSubject(null)
    }
    
    toast.success(`Deleted subject: ${subject?.name}`)
  }

  const handleUpdateSubject = (id: string, updates: Partial<Subject>) => {
    setSubjects(current => 
      current.map(subject => 
        subject.id === id ? { ...subject, ...updates } : subject
      )
    )
    
    // Update selected subject if it's the one being updated
    if (selectedSubject?.id === id) {
      setSelectedSubject(current => current ? { ...current, ...updates } : current)
    }
    
    toast.success('Subject updated successfully')
  }

  const handleSessionComplete = (duration: number) => {
    if (!selectedSubject) return

    const session: StudySession = {
      id: Date.now().toString(),
      subjectId: selectedSubject.id,
      startTime: new Date(),
      endTime: new Date(),
      duration: Math.round(duration),
      completed: true
    }

    setSessions(current => [...current, session])
    
    // Update subject total time
    setSubjects(current => 
      current.map(subject => 
        subject.id === selectedSubject.id 
          ? { ...subject, totalTime: subject.totalTime + Math.round(duration) }
          : subject
      )
    )

    // Trigger haptic feedback for study session completion
    mobileFeedback.studySessionComplete()

    setLastSessionDuration(Math.round(duration))
    setCompletionDialogOpen(true)
    
    toast.success(`Great job! You studied ${selectedSubject.name} for ${Math.round(duration)} minutes.`)
  }

  const handleSessionCancel = () => {
    toast.info('Study session cancelled')
  }

  // Task management functions
  const handleAddTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date()
    }
    setTasks(current => [...current, newTask])
  }

  const handleToggleTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    const updatedTask = {
      ...task,
      completed: !task.completed,
      completedAt: !task.completed ? new Date() : undefined
    }

    setTasks(current => 
      current.map(t => t.id === taskId ? updatedTask : t)
    )

    if (!task.completed) {
      // Trigger haptic feedback for task completion
      mobileFeedback.taskComplete()
      
      // Show celebration for completed task
      setCelebrationData({
        isOpen: true,
        taskTitle: task.title,
        isChallenge: false
      })
    }
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks(current => current.filter(t => t.id !== taskId))
    toast.success('Task deleted')
  }

  // Challenge management functions
  const handleCreateChallenge = (challengeData: Omit<Challenge, 'id' | 'createdAt'>) => {
    const newChallenge: Challenge = {
      ...challengeData,
      id: Date.now().toString(),
      createdAt: new Date()
    }
    setChallenges(current => [...current, newChallenge])
  }

  const handleJoinChallenge = (code: string) => {
    const challenge = challenges.find(c => c.code === code && c.isActive)
    if (!challenge) {
      toast.error('Challenge not found or inactive')
      return
    }

    if (challenge.participants.includes(currentUserId)) {
      toast.info('You are already participating in this challenge')
      return
    }

    setChallenges(current => 
      current.map(c => 
        c.id === challenge.id 
          ? { ...c, participants: [...c.participants, currentUserId] }
          : c
      )
    )
    toast.success(`Joined challenge: ${challenge.title}`)
  }

  const handleAddChallengeTask = (challengeId: string, taskData: Omit<import('@/lib/types').ChallengeTask, 'id' | 'createdAt' | 'completedBy'>) => {
    const newTask: import('@/lib/types').ChallengeTask = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
      completedBy: []
    }

    setChallenges(current => 
      current.map(c => 
        c.id === challengeId 
          ? { ...c, tasks: [...c.tasks, newTask] }
          : c
      )
    )
  }

  const handleToggleChallengeTask = (challengeId: string, taskId: string) => {
    const challenge = challenges.find(c => c.id === challengeId)
    const task = challenge?.tasks.find(t => t.id === taskId)
    if (!challenge || !task) return

    const isCompleted = task.completedBy.includes(currentUserId)
    const updatedCompletedBy = isCompleted
      ? task.completedBy.filter(id => id !== currentUserId)
      : [...task.completedBy, currentUserId]

    setChallenges(current => 
      current.map(c => 
        c.id === challengeId 
          ? {
              ...c,
              tasks: c.tasks.map(t => 
                t.id === taskId 
                  ? { ...t, completedBy: updatedCompletedBy }
                  : t
              )
            }
          : c
      )
    )

    if (!isCompleted) {
      // Trigger special haptic feedback for challenge task completion
      mobileFeedback.challengeTaskComplete()
      
      // Show celebration for completed challenge task
      setCelebrationData({
        isOpen: true,
        taskTitle: task.title,
        isChallenge: true,
        challengeTitle: challenge.title,
        points: task.points
      })
    }
  }

  const handleSwitchProgressView = () => {
    setShowChallengeProgress(!showChallengeProgress)
  }

  return (
    <div className="min-h-screen relative" ref={containerRef}>
      <SpaceBackground />
      <OfflineIndicator />
      {!isStandalone && <PWAInstallPrompt />}
      
      <div className="relative z-10 container max-w-md mx-auto p-4 pb-28 no-select">
        <header className="text-center py-6">
          <h1 className="text-2xl font-bold text-white drop-shadow-lg">StudyPartner</h1>
          <p className="text-white/80 text-sm drop-shadow">Your mobile study companion</p>
          <div className="mt-3 flex justify-center">
            <HapticTestPanel />
          </div>
        </header>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <div className="sticky top-0 bg-black/20 backdrop-blur-md z-20 py-2 rounded-lg border border-white/10">
            <TabsList className="grid w-full grid-cols-6 bg-white/10 backdrop-blur-sm">
              <TabsTrigger value="timer" className="flex-col gap-1 h-16 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white transition-all duration-200">
                <Clock size={18} />
                <span className="text-xs">Timer</span>
              </TabsTrigger>
              <TabsTrigger value="subjects" className="flex-col gap-1 h-16 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white transition-all duration-200">
                <BookOpen size={18} />
                <span className="text-xs">Subjects</span>
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex-col gap-1 h-16 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white transition-all duration-200">
                <CheckSquare size={18} />
                <span className="text-xs">Tasks</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex-col gap-1 h-16 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white transition-all duration-200">
                <CalendarIcon size={18} />
                <span className="text-xs">Calendar</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex-col gap-1 h-16 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white transition-all duration-200">
                <ChartBar size={18} />
                <span className="text-xs">Stats</span>
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex-col gap-1 h-16 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white transition-all duration-200">
                <Trophy size={18} />
                <span className="text-xs">Awards</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="timer" className="space-y-4 m-0">
            <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white/10 p-4">
              <TargetNotifications 
                subjects={subjects}
                sessions={sessions}
                onSelectSubject={setSelectedSubject}
              />
            </div>
            
            {!selectedSubject ? (
              <div className="text-center py-8 bg-black/20 backdrop-blur-md rounded-lg border border-white/10">
                <BookOpen size={48} className="mx-auto text-white/60 mb-4" />
                <h3 className="font-medium mb-2 text-white">Select a Subject First</h3>
                <p className="text-sm text-white/70 mb-4">
                  Choose a subject from the Subjects tab to start studying
                </p>
              </div>
            ) : (
              <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white/10 p-4">
                <Timer
                  subject={selectedSubject}
                  onSessionComplete={handleSessionComplete}
                  onSessionCancel={handleSessionCancel}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="subjects" className="space-y-4 m-0">
            <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white/10 p-4">
              <SubjectManagement
                subjects={subjects}
                selectedSubject={selectedSubject}
                onAddSubject={handleAddSubject}
                onDeleteSubject={handleDeleteSubject}
                onUpdateSubject={handleUpdateSubject}
                onSelectSubject={setSelectedSubject}
              />
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4 m-0">
            <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white/10 p-4">
              <TasksManagement
                tasks={tasks}
                challenges={challenges}
                subjects={subjects}
                taskProgress={taskProgress}
                currentUserId={currentUserId}
                onAddTask={handleAddTask}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
                onCreateChallenge={handleCreateChallenge}
                onJoinChallenge={handleJoinChallenge}
                onAddChallengeTask={handleAddChallengeTask}
                onToggleChallengeTask={handleToggleChallengeTask}
                onSwitchProgressView={handleSwitchProgressView}
              />
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4 m-0">
            <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white/10 p-4">
              <Calendar subjects={subjects} />
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4 m-0">
            <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white/10 p-4">
              <TargetProgress subjects={subjects} sessions={sessions} />
            </div>
            <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white/10 p-4">
              <StatsOverview stats={stats} achievements={achievements} sessions={sessions} />
            </div>
            <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white/10 p-4">
              <ProgressCharts sessions={sessions} subjects={subjects} />
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4 m-0">
            <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white/10 p-4">
              <Achievements achievements={achievements} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <QuotesBar />
      <DeviceIndicator />

      <Dialog open={completionDialogOpen} onOpenChange={setCompletionDialogOpen}>
        <DialogContent className="bg-black/80 backdrop-blur-md border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-center text-white">🎉 Session Complete!</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <div className="bg-accent/20 rounded-lg p-4 border border-accent/30">
              <div className="text-2xl font-bold text-accent">
                {lastSessionDuration} minutes
              </div>
              <div className="text-sm text-white/70">
                Great focus on {selectedSubject?.name}!
              </div>
            </div>
            <Button 
              onClick={() => setCompletionDialogOpen(false)}
              className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              Continue Studying
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <TaskCelebration
        isOpen={celebrationData.isOpen}
        onClose={() => setCelebrationData({ ...celebrationData, isOpen: false })}
        taskTitle={celebrationData.taskTitle}
        isChallenge={celebrationData.isChallenge}
        challengeTitle={celebrationData.challengeTitle}
        points={celebrationData.points}
      />

      <Toaster 
        position="top-center" 
        richColors 
        closeButton
        toastOptions={{
          style: {
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
          }
        }}
      />
    </div>
  )
}

export default App