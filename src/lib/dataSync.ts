import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { User } from 'firebase/auth'

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
  private user: User | null = null
  private syncInterval: NodeJS.Timeout | null = null
  private unsubscribeCallbacks: (() => void)[] = []

  constructor(user: User | null) {
    this.user = user
  }

  // Initialize sync for a user
  async initializeSync(user: User) {
    this.user = user
    
    // Load user data from Firestore
    await this.loadUserData()
    
    // Set up real-time sync
    this.setupRealtimeSync()
    
    // Set up periodic backup
    this.setupPeriodicSync()
  }

  // Clean up sync when user logs out
  cleanup() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
    
    this.unsubscribeCallbacks.forEach(unsubscribe => unsubscribe())
    this.unsubscribeCallbacks = []
    
    this.user = null
  }

  // Load user data from Firestore
  private async loadUserData() {
    if (!this.user) return

    try {
      const userDataDoc = await getDoc(doc(db, 'study-data', this.user.uid))
      
      if (userDataDoc.exists()) {
        const data = userDataDoc.data() as UserData
        
        // Update local storage with Firestore data using user-scoped keys
        const userKey = (key: string) => `${this.user!.uid}-${key}`
        
        if (data.subjects) localStorage.setItem(userKey('study-subjects'), JSON.stringify(data.subjects))
        if (data.sessions) localStorage.setItem(userKey('study-sessions'), JSON.stringify(data.sessions))
        if (data.achievements) localStorage.setItem(userKey('achievements'), JSON.stringify(data.achievements))
        if (data.tasks) localStorage.setItem(userKey('tasks'), JSON.stringify(data.tasks))
        if (data.challenges) localStorage.setItem(userKey('challenges'), JSON.stringify(data.challenges))
        if (data.focusSessions) localStorage.setItem(userKey('focus-sessions'), JSON.stringify(data.focusSessions))
        if (data.goals) localStorage.setItem(userKey('focus-goals'), JSON.stringify(data.goals))
        if (data.notes) localStorage.setItem(userKey('sticky-notes'), JSON.stringify(data.notes))
        if (data.events) localStorage.setItem(userKey('calendar-events'), JSON.stringify(data.events))
        if (data.dismissedNotifications) localStorage.setItem(userKey('dismissed-notifications'), JSON.stringify(data.dismissedNotifications))
        
        console.log('User data loaded from Firestore')
      } else {
        console.log('No existing user data in Firestore')
        // First time user - sync local data to Firestore
        await this.syncToFirestore()
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  // Sync local data to Firestore
  async syncToFirestore() {
    if (!this.user) return

    try {
      // Emit sync start event
      window.dispatchEvent(new CustomEvent('syncStart'))
      
      // Use user-scoped keys
      const userKey = (key: string) => `${this.user!.uid}-${key}`
      
      const userData: UserData = {
        subjects: JSON.parse(localStorage.getItem(userKey('study-subjects')) || '[]'),
        sessions: JSON.parse(localStorage.getItem(userKey('study-sessions')) || '[]'),
        achievements: JSON.parse(localStorage.getItem(userKey('achievements')) || '[]'),
        tasks: JSON.parse(localStorage.getItem(userKey('tasks')) || '[]'),
        challenges: JSON.parse(localStorage.getItem(userKey('challenges')) || '[]'),
        focusSessions: JSON.parse(localStorage.getItem(userKey('focus-sessions')) || '[]'),
        goals: JSON.parse(localStorage.getItem(userKey('focus-goals')) || '[]'),
        notes: JSON.parse(localStorage.getItem(userKey('sticky-notes')) || '[]'),
        events: JSON.parse(localStorage.getItem(userKey('calendar-events')) || '[]'),
        dismissedNotifications: JSON.parse(localStorage.getItem(userKey('dismissed-notifications')) || '[]'),
        lastSyncAt: serverTimestamp()
      }

      await setDoc(doc(db, 'study-data', this.user.uid), userData, { merge: true })
      localStorage.setItem(`${this.user.uid}-lastSyncAt`, new Date().toISOString())
      
      // Emit sync success event
      window.dispatchEvent(new CustomEvent('dataSync'))
      console.log('Data synced to Firestore')
    } catch (error) {
      console.error('Error syncing to Firestore:', error)
      // Emit sync error event
      window.dispatchEvent(new CustomEvent('syncError'))
    }
  }

  // Set up real-time sync listener
  private setupRealtimeSync() {
    if (!this.user) return

    const unsubscribe = onSnapshot(
      doc(db, 'study-data', this.user.uid),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data() as UserData
          
          // Only update if the data is newer than local data
          const localLastSync = localStorage.getItem(`${this.user!.uid}-lastSyncAt`)
          const firestoreLastSync = data.lastSyncAt?.toMillis?.() || 0
          const localLastSyncTime = localLastSync ? new Date(localLastSync).getTime() : 0
          
          if (firestoreLastSync > localLastSyncTime) {
            // Update local storage with newer Firestore data using user-scoped keys
            const userKey = (key: string) => `${this.user!.uid}-${key}`
            
            if (data.subjects) localStorage.setItem(userKey('study-subjects'), JSON.stringify(data.subjects))
            if (data.sessions) localStorage.setItem(userKey('study-sessions'), JSON.stringify(data.sessions))
            if (data.achievements) localStorage.setItem(userKey('achievements'), JSON.stringify(data.achievements))
            if (data.tasks) localStorage.setItem(userKey('tasks'), JSON.stringify(data.tasks))
            if (data.challenges) localStorage.setItem(userKey('challenges'), JSON.stringify(data.challenges))
            if (data.focusSessions) localStorage.setItem(userKey('focus-sessions'), JSON.stringify(data.focusSessions))
            if (data.goals) localStorage.setItem(userKey('focus-goals'), JSON.stringify(data.goals))
            if (data.notes) localStorage.setItem(userKey('sticky-notes'), JSON.stringify(data.notes))
            if (data.events) localStorage.setItem(userKey('calendar-events'), JSON.stringify(data.events))
            if (data.dismissedNotifications) localStorage.setItem(userKey('dismissed-notifications'), JSON.stringify(data.dismissedNotifications))
            
            localStorage.setItem(`${this.user!.uid}-lastSyncAt`, new Date().toISOString())
            console.log('Local data updated from Firestore')
            
            // Trigger a custom event to notify components of data update
            window.dispatchEvent(new CustomEvent('dataSync'))
          }
        }
      },
      (error) => {
        console.error('Real-time sync error:', error)
      }
    )

    this.unsubscribeCallbacks.push(unsubscribe)
  }

  // Set up periodic sync every 30 seconds
  private setupPeriodicSync() {
    this.syncInterval = setInterval(() => {
      this.syncToFirestore()
    }, 30000) // 30 seconds
  }

  // Manual sync method
  async manualSync() {
    await this.syncToFirestore()
  }
}

// Global instance
export let dataSyncService: DataSyncService | null = null

// Initialize sync service
export const initializeDataSync = (user: User | null) => {
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