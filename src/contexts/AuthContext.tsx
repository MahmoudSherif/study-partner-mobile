import React, { createContext, useContext, useEffect, useState } from 'react'

interface User {
  uid: string
  email: string | null
  displayName: string | null
}

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

  // Check for existing user session on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('motivamate-user')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
      } catch (error) {
        localStorage.removeItem('motivamate-user')
      }
    }
    setLoading(false)
  }, [])

  const generateUserId = () => {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  const signUp = async (email: string, password: string, displayName?: string) => {
    setLoading(true)
    
    try {
      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('motivamate-users') || '{}')
      if (existingUsers[email]) {
        setLoading(false)
        return { user: null, error: 'User already exists with this email' }
      }

      // Create new user
      const newUser: User = {
        uid: generateUserId(),
        email,
        displayName: displayName || email.split('@')[0]
      }

      // Save user credentials (in production, passwords should be hashed)
      existingUsers[email] = {
        user: newUser,
        password // Note: In real production, this should be hashed
      }
      localStorage.setItem('motivamate-users', JSON.stringify(existingUsers))

      // Set current user
      setUser(newUser)
      localStorage.setItem('motivamate-user', JSON.stringify(newUser))

      setLoading(false)
      return { user: newUser, error: null }
    } catch (error: any) {
      setLoading(false)
      return { user: null, error: 'Failed to create account' }
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    
    try {
      const existingUsers = JSON.parse(localStorage.getItem('motivamate-users') || '{}')
      const userRecord = existingUsers[email]

      if (!userRecord || userRecord.password !== password) {
        setLoading(false)
        return { user: null, error: 'Invalid email or password' }
      }

      // Set current user
      setUser(userRecord.user)
      localStorage.setItem('motivamate-user', JSON.stringify(userRecord.user))

      setLoading(false)
      return { user: userRecord.user, error: null }
    } catch (error: any) {
      setLoading(false)
      return { user: null, error: 'Failed to sign in' }
    }
  }

  const signInWithGoogle = async () => {
    setLoading(true)
    
    // For demo purposes, create a demo Google user
    try {
      const demoUser: User = {
        uid: generateUserId(),
        email: 'demo@gmail.com',
        displayName: 'Demo User'
      }

      setUser(demoUser)
      localStorage.setItem('motivamate-user', JSON.stringify(demoUser))

      setLoading(false)
      return { user: demoUser, error: null }
    } catch (error: any) {
      setLoading(false)
      return { user: null, error: 'Failed to sign in with Google' }
    }
  }

  const signOut = async () => {
    setLoading(true)
    
    try {
      setUser(null)
      localStorage.removeItem('motivamate-user')
      setLoading(false)
      return { error: null }
    } catch (error: any) {
      setLoading(false)
      return { error: 'Failed to sign out' }
    }
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