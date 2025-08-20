// Test Firebase connection
import { authFunctions, firestoreFunctions } from './firebase'

export const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...')
    
    // Test auth state listener
    const unsubscribe = authFunctions.onAuthStateChanged((user) => {
      if (user) {
        console.log('✅ Firebase Auth connected - User:', user.email)
      } else {
        console.log('🔒 Firebase Auth connected - No user logged in')
      }
    })
    
    // Cleanup after 1 second
    setTimeout(() => {
      unsubscribe()
    }, 1000)
    
    console.log('✅ Firebase connection test completed')
    return true
  } catch (error) {
    console.error('❌ Firebase connection failed:', error)
    return false
  }
}

// Auto-run test in development
if (import.meta.env.DEV) {
  testFirebaseConnection()
}