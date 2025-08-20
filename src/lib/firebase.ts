// Firebase authentication and Firestore functions for production
import { initializeApp } from 'firebase/app'
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User
} from 'firebase/auth'
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore'

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

// Google provider
const googleProvider = new GoogleAuthProvider()

// Auth functions for production
export const authFunctions = {
  // Sign up with email and password
  signUp: async (email: string, password: string, displayName?: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update user profile with display name
      if (displayName && result.user) {
        await updateProfile(result.user, { displayName })
      }
      
      return { user: result.user, error: null }
    } catch (error: any) {
      return { user: null, error: error.message }
    }
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      return { user: result.user, error: null }
    } catch (error: any) {
      return { user: null, error: error.message }
    }
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      return { user: result.user, error: null }
    } catch (error: any) {
      return { user: null, error: error.message }
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await firebaseSignOut(auth)
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  },

  // Get current user
  getCurrentUser: () => {
    return auth.currentUser
  },

  // Listen to auth state changes
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback)
  }
}

// Firestore functions for production
export const firestoreFunctions = {
  // Get user profile
  getUserProfile: async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return { data: docSnap.data(), error: null }
      } else {
        return { data: null, error: 'User not found' }
      }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  },

  // Update user profile
  updateUserProfile: async (uid: string, data: any) => {
    try {
      const docRef = doc(db, 'users', uid)
      await updateDoc(docRef, data)
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  },

  // Create user profile
  createUserProfile: async (uid: string, data: any) => {
    try {
      const docRef = doc(db, 'users', uid)
      await setDoc(docRef, data)
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }
}