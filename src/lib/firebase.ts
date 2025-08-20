// Using mock authentication for demo purposes
// This provides a fully functional auth system that works offline
import { mockAuthFunctions } from './mockAuth'

// Auth functions - using mock auth for demo
export const authFunctions = mockAuthFunctions

// Mock Firestore functions for demo
export const firestoreFunctions = {
  // Get user profile
  getUserProfile: async (uid: string) => {
    try {
      const users = JSON.parse(localStorage.getItem('mockAuth_users') || '[]')
      const user = users.find((u: any) => u.uid === uid)
      return { data: user || null, error: user ? null : 'User not found' }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  },

  // Update user profile
  updateUserProfile: async (uid: string, data: any) => {
    try {
      const users = JSON.parse(localStorage.getItem('mockAuth_users') || '[]')
      const userIndex = users.findIndex((u: any) => u.uid === uid)
      if (userIndex >= 0) {
        users[userIndex] = { ...users[userIndex], ...data }
        localStorage.setItem('mockAuth_users', JSON.stringify(users))
      }
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }
}