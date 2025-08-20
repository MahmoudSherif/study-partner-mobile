import React, { createContext, useContext, useEffect, useState } from 'react'
import { authFunctions } from '@/lib/firebase'
import { initializeDataSync, cleanupDataSync } from '@/lib/dataSync'
import { User } from 'firebase/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, displayName?: string) => Promise<{ user: User | null; error: string | null }>
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>
  signInWithGoogle: () => Promise<{ user: User | null; error: string | null }>
  signOut: () => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = authFunctions.onAuthStateChanged((user) => {
      setUser(user)
      setLoading(false)
      
      // Initialize or cleanup data sync based on auth state
      if (user) {
        initializeDataSync(user)
      } else {
        cleanupDataSync()
      }
    })

    return () => {
      unsubscribe()
      cleanupDataSync()
    }
  }, [])

  const signUp = async (email: string, password: string, displayName?: string) => {
    setLoading(true)
    const result = await authFunctions.signUp(email, password, displayName)
    setLoading(false)
    return result
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    const result = await authFunctions.signIn(email, password)
    setLoading(false)
    return result
  }

  const signInWithGoogle = async () => {
    setLoading(true)
    const result = await authFunctions.signInWithGoogle()
    setLoading(false)
    return result
  }

  const signOut = async () => {
    setLoading(true)
    const result = await authFunctions.signOut()
    setLoading(false)
    return result
  }

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}