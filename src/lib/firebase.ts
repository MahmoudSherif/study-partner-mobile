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
import { getAnalytics } from 'firebase/analytics'

// Firebase configuration with environment variables and fallback
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA5NwasV9Zq0nD7m1hTIHyBYT1-HvqousU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "motivemate-6c846.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "motivemate-6c846",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "motivemate-6c846.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1009214726351",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1009214726351:web:20b0c745c8222feb5557ba",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-360M7L231L"
}

// Only validate environment variables in production
if (import.meta.env.PROD) {
  // In production, log a warning if environment variables are not set
  const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN', 
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ]

  const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName])
  
  if (missingVars.length > 0) {
    console.warn(
      `Using fallback Firebase configuration. For better security, please set these environment variables in Netlify: ${missingVars.join(', ')}`
    )
  }
}

// Validate configuration values
if (firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith('AIza')) {
  console.warn('Firebase API key format appears invalid')
}

if (firebaseConfig.projectId && !firebaseConfig.projectId.match(/^[a-z0-9-]+$/)) {
  console.warn('Firebase project ID format appears invalid')
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

// Initialize Analytics and get a reference to the service
// Only initialize analytics if measurementId is provided and in browser environment
let analytics: any = null
if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
  try {
    analytics = getAnalytics(app)
  } catch (error) {
    console.warn('Analytics initialization failed:', error)
  }
}

export { analytics }

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