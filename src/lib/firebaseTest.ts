// Test Mock Auth connection
import { authFunctions, firestoreFunctions } from './firebase'

export const testFirebaseConnection = async () => {
  try {
    console.log('Testing Mock Auth connection...')
    
    // Test auth state listener
    const unsubscribe = authFunctions.onAuthStateChanged((user) => {
      if (user) {
        console.log('✅ Mock Auth connected - User:', user.email)
      } else {
        console.log('🔒 Mock Auth connected - No user logged in')
      }
    })
    
    // Cleanup after 1 second
    setTimeout(() => {
      unsubscribe()
    }, 1000)
    
    console.log('✅ Mock Auth connection test completed')
    return true
  } catch (error) {
    console.error('❌ Mock Auth connection failed:', error)
    return false
  }
}

// Auto-run test in development
if (import.meta.env.DEV) {
  testFirebaseConnection()
}