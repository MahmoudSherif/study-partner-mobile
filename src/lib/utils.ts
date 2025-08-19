import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Achievement, Subject, StudySession, UserStats } from './types'
import { INITIAL_ACHIEVEMENTS } from './constants'
import { calculateStudyStreak } from './chartUtils'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateUserStats(sessions: StudySession[]): UserStats {
  const completedSessions = sessions.filter(s => s.completed)
  const totalTime = completedSessions.reduce((total, session) => total + session.duration, 0)
  
  // Use the improved streak calculation from chartUtils
  const streak = calculateStudyStreak(sessions)

  return {
    totalStudyTime: totalTime,
    streak,
    longestStreak: streak, // Simplified for now
    sessionsCompleted: completedSessions.length,
    averageSessionLength: completedSessions.length > 0 ? Math.round(totalTime / completedSessions.length) : 0
  }
}

export function updateAchievements(
  currentAchievements: Achievement[],
  stats: UserStats,
  sessions: StudySession[]
): Achievement[] {
  return currentAchievements.map(achievement => {
    let progress = 0
    
    switch (achievement.id) {
      case 'first-session':
        progress = stats.sessionsCompleted
        break
      case 'hour-milestone':
        progress = stats.totalStudyTime
        break
      case 'week-warrior':
        progress = stats.streak
        break
      case 'focus-master':
        progress = stats.sessionsCompleted
        break
      case 'century-club':
        progress = stats.totalStudyTime
        break
    }
    
    const unlocked = progress >= achievement.requirement
    
    return {
      ...achievement,
      progress: Math.min(progress, achievement.requirement),
      unlocked,
      unlockedAt: unlocked && !achievement.unlocked ? new Date() : achievement.unlockedAt
    }
  })
}

export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours === 0) {
    return `${mins}m`
  }
  
  if (mins === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${mins}m`
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function getSubjectById(subjects: Subject[], id: string): Subject | undefined {
  return subjects.find(subject => subject.id === id)
}