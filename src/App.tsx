import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Timer } from '@/components/Timer'
import { SubjectManagement } from '@/components/SubjectManagement'
import { StatsOverview } from '@/components/StatsOverview'
import { ProgressCharts } from '@/components/ProgressCharts'
import { TargetProgress } from '@/components/TargetProgress'
import { TargetNotifications } from '@/components/TargetNotifications'
import { Achievements } from '@/components/Achievements'
import { Subject, StudySession, Achievement } from '@/lib/types'
import { INITIAL_ACHIEVEMENTS } from '@/lib/constants'
import { calculateUserStats, updateAchievements } from '@/lib/utils'
import { Clock, ChartBar, Trophy, BookOpen } from '@phosphor-icons/react'
import { toast, Toaster } from 'sonner'

function App() {
  const [subjects, setSubjects] = useKV<Subject[]>('study-subjects', [])
  const [sessions, setSessions] = useKV<StudySession[]>('study-sessions', [])
  const [achievements, setAchievements] = useKV<Achievement[]>('achievements', INITIAL_ACHIEVEMENTS)
  
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false)
  const [lastSessionDuration, setLastSessionDuration] = useState(0)

  const stats = calculateUserStats(sessions)

  useEffect(() => {
    const updatedAchievements = updateAchievements(achievements, stats, sessions)
    
    // Check for newly unlocked achievements
    const newlyUnlocked = updatedAchievements.filter((achievement, index) => 
      achievement.unlocked && !achievements[index]?.unlocked
    )
    
    if (newlyUnlocked.length > 0) {
      setAchievements(updatedAchievements)
      newlyUnlocked.forEach(achievement => {
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

    setLastSessionDuration(Math.round(duration))
    setCompletionDialogOpen(true)
    
    toast.success(`Great job! You studied ${selectedSubject.name} for ${Math.round(duration)} minutes.`)
  }

  const handleSessionCancel = () => {
    toast.info('Study session cancelled')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-md mx-auto p-4 pb-20">
        <header className="text-center py-6">
          <h1 className="text-2xl font-bold text-primary">StudyPartner</h1>
          <p className="text-muted-foreground text-sm">Your mobile study companion</p>
        </header>

        <Tabs defaultValue="timer" className="space-y-6">
          <div className="sticky top-0 bg-background/80 backdrop-blur-sm z-10 py-2">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="timer" className="flex-col gap-1 h-16">
                <Clock size={20} />
                <span className="text-xs">Timer</span>
              </TabsTrigger>
              <TabsTrigger value="subjects" className="flex-col gap-1 h-16">
                <BookOpen size={20} />
                <span className="text-xs">Subjects</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex-col gap-1 h-16">
                <ChartBar size={20} />
                <span className="text-xs">Stats</span>
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex-col gap-1 h-16">
                <Trophy size={20} />
                <span className="text-xs">Awards</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="timer" className="space-y-4 m-0">
            <TargetNotifications 
              subjects={subjects}
              sessions={sessions}
              onSelectSubject={setSelectedSubject}
            />
            
            {!selectedSubject ? (
              <div className="text-center py-8">
                <BookOpen size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Select a Subject First</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose a subject from the Subjects tab to start studying
                </p>
              </div>
            ) : (
              <Timer
                subject={selectedSubject}
                onSessionComplete={handleSessionComplete}
                onSessionCancel={handleSessionCancel}
              />
            )}
          </TabsContent>

          <TabsContent value="subjects" className="space-y-4 m-0">
            <SubjectManagement
              subjects={subjects}
              selectedSubject={selectedSubject}
              onAddSubject={handleAddSubject}
              onDeleteSubject={handleDeleteSubject}
              onUpdateSubject={handleUpdateSubject}
              onSelectSubject={setSelectedSubject}
            />
          </TabsContent>

          <TabsContent value="stats" className="space-y-4 m-0">
            <TargetProgress subjects={subjects} sessions={sessions} />
            <StatsOverview stats={stats} achievements={achievements} sessions={sessions} />
            <ProgressCharts sessions={sessions} subjects={subjects} />
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4 m-0">
            <Achievements achievements={achievements} />
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={completionDialogOpen} onOpenChange={setCompletionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">🎉 Session Complete!</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <div className="bg-accent/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-accent">
                {lastSessionDuration} minutes
              </div>
              <div className="text-sm text-muted-foreground">
                Great focus on {selectedSubject?.name}!
              </div>
            </div>
            <Button 
              onClick={() => setCompletionDialogOpen(false)}
              className="w-full"
            >
              Continue Studying
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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