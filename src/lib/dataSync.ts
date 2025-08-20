// Data sync service for production with Firebase Firestore
import { User } from 'firebase/auth'
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from './firebase'

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

  constructor(user: User | null) {
    this.user = user
  }

  // Initialize sync for a user
  async initializeSync(user: User) {
    this.user = user
    
    try {
      // Create user document if it doesn't exist
      const userDocRef = doc(db, 'users', user.uid)
      const userDoc = await getDoc(userDocRef)
      
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          email: user.email,
          displayName: user.displayName,
          createdAt: serverTimestamp(),
          lastSyncAt: serverTimestamp()
        })
      }
      
      // Emit sync success event
      window.dispatchEvent(new CustomEvent('dataSync'))
    } catch (error) {
      console.error('Failed to initialize sync:', error)
    }
  }

  // Clean up sync when user logs out
  cleanup() {
    this.user = null
  }

  // Sync user data to Firestore
  async syncToFirestore(userData: Partial<UserData>) {
    if (!this.user) return
    
    try {
      // Emit sync start event
      window.dispatchEvent(new CustomEvent('syncStart'))
      
      const userDocRef = doc(db, 'users', this.user.uid)
      const dataToSync = {
        ...userData,
        lastSyncAt: serverTimestamp()
      }
      
      await setDoc(userDocRef, dataToSync, { merge: true })
      
      // Emit sync complete event
      window.dispatchEvent(new CustomEvent('dataSync'))
    } catch (error) {
      console.error('Failed to sync data:', error)
      // Emit sync error event
      window.dispatchEvent(new CustomEvent('syncError'))
    }
  }

  // Load user data from Firestore
  async loadFromFirestore(): Promise<UserData | null> {
    if (!this.user) return null
    
    try {
      const userDocRef = doc(db, 'users', this.user.uid)
      const userDoc = await getDoc(userDocRef)
      
      if (userDoc.exists()) {
        const data = userDoc.data()
        return {
          subjects: data.subjects || [],
          sessions: data.sessions || [],
          achievements: data.achievements || [],
          tasks: data.tasks || [],
          challenges: data.challenges || [],
          focusSessions: data.focusSessions || [],
          goals: data.goals || [],
          notes: data.notes || [],
          events: data.events || [],
          dismissedNotifications: data.dismissedNotifications || [],
          lastSyncAt: data.lastSyncAt
        }
      }
      
      return null
    } catch (error) {
      console.error('Failed to load data:', error)
      return null
    }
  }

  // Manual sync method
  async manualSync(userData: Partial<UserData>) {
    await this.syncToFirestore(userData)
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