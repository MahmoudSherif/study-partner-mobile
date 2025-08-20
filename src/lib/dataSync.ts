// Mock data sync service for demo purposes
// In a real app, this would sync with Firebase Firestore

interface MockUser {
  uid: string
  email: string | null
  displayName: string | null
}

export interface UserData {
  subjects: any[]
  sessions: any[]
  achievements: any[]
  tasks: any[]
  challenges: any[]
  focusSessions: any[]
  goals: any[]
  notes: any[]
  events: any[]
  dismissedNotifications: string[]
  lastSyncAt: any
}

export class DataSyncService {
  private user: MockUser | null = null

  constructor(user: MockUser | null) {
    this.user = user
  }

  // Initialize sync for a user
  async initializeSync(user: MockUser) {
    this.user = user
    console.log('Mock data sync initialized for user:', user.email)
    
    // Emit sync success event
    window.dispatchEvent(new CustomEvent('dataSync'))
  }

  // Clean up sync when user logs out
  cleanup() {
    this.user = null
    console.log('Mock data sync cleaned up')
  }

  // Mock sync to Firestore (does nothing in demo)
  async syncToFirestore() {
    if (!this.user) return
    
    console.log('Mock sync to Firestore for user:', this.user.email)
    
    // Emit sync events for UI feedback
    window.dispatchEvent(new CustomEvent('syncStart'))
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    window.dispatchEvent(new CustomEvent('dataSync'))
  }

  // Manual sync method
  async manualSync() {
    await this.syncToFirestore()
  }
}

// Global instance
export let dataSyncService: DataSyncService | null = null

// Initialize sync service
export const initializeDataSync = (user: MockUser | null) => {
  if (dataSyncService) {
    dataSyncService.cleanup()
  }
  
  if (user) {
    dataSyncService = new DataSyncService(user)
    dataSyncService.initializeSync(user)
  } else {
    dataSyncService = null
  }
}

// Clean up sync service
export const cleanupDataSync = () => {
  if (dataSyncService) {
    dataSyncService.cleanup()
    dataSyncService = null
  }
}