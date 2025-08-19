export interface Subject {
  id: string
  name: string
  color: string
  totalTime: number
  goal?: number
}

export interface StudySession {
  id: string
  subjectId: string
  startTime: Date
  endTime?: Date
  duration: number
  completed: boolean
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: Date
  requirement: number
  progress: number
}

export interface UserStats {
  totalStudyTime: number
  streak: number
  longestStreak: number
  sessionsCompleted: number
  averageSessionLength: number
}