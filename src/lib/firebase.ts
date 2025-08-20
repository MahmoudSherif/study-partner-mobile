import { initializeApp } from 'firebase/app'
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs 
} from 'firebase/firestore'

// Firebase configuration
// NOTE: In a real app, these would be environment variables
const firebaseConfig = {
  apiKey: "AIzaSyDemo_API_Key_Replace_With_Real_One",
  authDomain: "motivamate-demo.firebaseapp.com", 
  projectId: "motivamate-demo",
  storageBucket: "motivamate-demo.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:demo123456789abc"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider()

// Auth functions
export const authFunctions = {
  // Sign up with email and password
  signUp: async (email: string, password: string, displayName?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      
      // Update profile with display name if provided
      if (displayName) {
        await updateProfile(user, { displayName })
      }
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: displayName || user.email?.split('@')[0] || 'User',
        createdAt: new Date(),
        lastLoginAt: new Date()
      })
      
      return { user, error: null }
    } catch (error: any) {
      console.error('Sign up error:', error)
      // Provide user-friendly error messages
      let errorMessage = 'An error occurred during sign up'
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please sign in instead.'
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.'
      }
      return { user: null, error: errorMessage }
    }
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      
      // Update last login time
      await updateDoc(doc(db, 'users', user.uid), {
        lastLoginAt: new Date()
      })
      
      return { user, error: null }
    } catch (error: any) {
      console.error('Sign in error:', error)
      // Provide user-friendly error messages
      let errorMessage = 'Failed to sign in'
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please sign up first.'
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.'
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.'
      }
      return { user: null, error: errorMessage }
    }
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      
      // Check if user document exists, create if not
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          createdAt: new Date(),
          lastLoginAt: new Date()
        })
      } else {
        // Update last login time
        await updateDoc(doc(db, 'users', user.uid), {
          lastLoginAt: new Date()
        })
      }
      
      return { user, error: null }
    } catch (error: any) {
      return { user: null, error: error.message }
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await signOut(auth)
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

// Firestore functions
export const firestoreFunctions = {
  // Get user profile
  getUserProfile: async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (userDoc.exists()) {
        return { data: userDoc.data(), error: null }
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
      await updateDoc(doc(db, 'users', uid), data)
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }
}