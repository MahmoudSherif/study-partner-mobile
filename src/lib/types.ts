export interface Subject {
  id: string
  name: string
  color: string
  totalTime: number
  goal?: number
  dailyTarget?: number // minutes per day
  weeklyTarget?: number // minutes per week
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

export interface SubjectProgress {
  subjectId: string
  todayTime: number
  weekTime: number
  dailyTarget?: number
  weeklyTarget?: number
  dailyProgress: number // percentage 0-100
  weeklyProgress: number // percentage 0-100
  isBehindDaily: boolean
  isBehindWeekly: boolean
}

export interface TargetNotification {
  id: string
  subjectId: string
  subjectName: string
  type: 'daily' | 'weekly'
  message: string
  severity: 'warning' | 'danger'
  timestamp: Date
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  date: Date
  startTime?: string
  endTime?: string
  subjectId?: string
  type: 'study' | 'exam' | 'deadline' | 'reminder' | 'break'
  isAllDay: boolean
  color?: string
}