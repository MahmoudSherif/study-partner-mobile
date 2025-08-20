import React, { createContext, useContext, useEffect, useState } from 'react'
import { studyPartnerAPI, APIUser, handleAPIError, checkStudyPartnerConnection } from '@/lib/api'
import { dataSyncService } from '@/lib/sync'
import { toast } from 'sonner'

interface User {
  uid: string
  email: string | null
  displayName: string | null
  avatar?: string
  isFromStudyPartner?: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isConnectedToStudyPartner: boolean
  signUp: (email: string, password: string, displayName?: string) => Promise<{ user: User | null; error: string | null }>
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>
  signInWithGoogle: () => Promise<{ user: User | null; error: string | null }>
  signOut: () => Promise<{ error: string | null }>
  checkConnection: () => Promise<boolean>
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
  const [isConnectedToStudyPartner, setIsConnectedToStudyPartner] = useState(false)

  // Check StudyPartner connection on startup
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connected = await checkStudyPartnerConnection()
        setIsConnectedToStudyPartner(connected)
        
        if (connected) {
          // Try to get current user from StudyPartner if we have a token
          const authToken = studyPartnerAPI.getAuthToken()
          if (authToken) {
            const userResponse = await studyPartnerAPI.getCurrentUser()
            if (userResponse.success && userResponse.data) {
              const apiUser = userResponse.data
              const user: User = {
                uid: apiUser.id,
                email: apiUser.email,
                displayName: apiUser.displayName,
                avatar: apiUser.avatar,
                isFromStudyPartner: true
              }
              setUser(user)
              localStorage.setItem('motivamate-user', JSON.stringify(user))
              return
            }
          }
        }
        
        // Fallback to local storage if StudyPartner is not available
        const savedUser = localStorage.getItem('motivamate-user')
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser)
            setUser(parsedUser)
          } catch (error) {
            localStorage.removeItem('motivamate-user')
          }
        }
      } catch (error) {
        console.warn('Failed to check StudyPartner connection:', error)
        
        // Fallback to local auth
        const savedUser = localStorage.getItem('motivamate-user')
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser)
            setUser(parsedUser)
          } catch (error) {
            localStorage.removeItem('motivamate-user')
          }
        }
      } finally {
        setLoading(false)
      }
    }

    checkConnection()
  }, [])

  const generateUserId = () => {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  const signUp = async (email: string, password: string, displayName?: string) => {
    setLoading(true)
    
    try {
      // First try StudyPartner API
      if (isConnectedToStudyPartner) {
        const response = await studyPartnerAPI.signUp(
          email, 
          password, 
          displayName || email.split('@')[0]
        )
        
        if (response.success && response.data) {
          const apiUser = response.data.user
          const user: User = {
            uid: apiUser.id,
            email: apiUser.email,
            displayName: apiUser.displayName,
            avatar: apiUser.avatar,
            isFromStudyPartner: true
          }
          
          setUser(user)
          localStorage.setItem('motivamate-user', JSON.stringify(user))
          
          // Start data sync
          await dataSyncService.performSync()
          
          setLoading(false)
          toast.success('Account created and synced with StudyPartner!')
          return { user, error: null }
        } else {
          const errorMessage = handleAPIError(response.error || 'Registration failed')
          setLoading(false)
          return { user: null, error: errorMessage }
        }
      }
      
      // Fallback to local storage
      const existingUsers = JSON.parse(localStorage.getItem('motivamate-users') || '{}')
      if (existingUsers[email]) {
        setLoading(false)
        return { user: null, error: 'User already exists with this email' }
      }

      const newUser: User = {
        uid: generateUserId(),
        email,
        displayName: displayName || email.split('@')[0],
        isFromStudyPartner: false
      }

      existingUsers[email] = {
        user: newUser,
        password
      }
      localStorage.setItem('motivamate-users', JSON.stringify(existingUsers))

      setUser(newUser)
      localStorage.setItem('motivamate-user', JSON.stringify(newUser))

      setLoading(false)
      toast.info('Account created locally. Connect to StudyPartner to sync across devices.')
      return { user: newUser, error: null }
    } catch (error: any) {
      setLoading(false)
      return { user: null, error: 'Failed to create account' }
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    
    try {
      // First try StudyPartner API
      if (isConnectedToStudyPartner) {
        const response = await studyPartnerAPI.signIn(email, password)
        
        if (response.success && response.data) {
          const apiUser = response.data.user
          const user: User = {
            uid: apiUser.id,
            email: apiUser.email,
            displayName: apiUser.displayName,
            avatar: apiUser.avatar,
            isFromStudyPartner: true
          }
          
          setUser(user)
          localStorage.setItem('motivamate-user', JSON.stringify(user))
          
          // Start data sync
          await dataSyncService.performSync()
          
          setLoading(false)
          toast.success('Signed in and synced with StudyPartner!')
          return { user, error: null }
        } else {
          // Try local fallback if StudyPartner auth fails
          const errorMessage = handleAPIError(response.error || 'Sign in failed')
          
          // Don't return error immediately, try local auth first
          console.warn('StudyPartner auth failed, trying local auth:', errorMessage)
        }
      }
      
      // Fallback to local storage
      const existingUsers = JSON.parse(localStorage.getItem('motivamate-users') || '{}')
      const userRecord = existingUsers[email]

      if (!userRecord || userRecord.password !== password) {
        setLoading(false)
        return { user: null, error: 'Invalid email or password' }
      }

      setUser(userRecord.user)
      localStorage.setItem('motivamate-user', JSON.stringify(userRecord.user))

      setLoading(false)
      if (isConnectedToStudyPartner) {
        toast.info('Signed in locally. Your StudyPartner account may have different credentials.')
      }
      return { user: userRecord.user, error: null }
    } catch (error: any) {
      setLoading(false)
      return { user: null, error: 'Failed to sign in' }
    }
  }

  const signInWithGoogle = async () => {
    setLoading(true)
    
    try {
      // Try StudyPartner Google auth if available
      if (isConnectedToStudyPartner) {
        // This would need actual Google OAuth integration
        // For now, show a message that this needs Google setup
        setLoading(false)
        return { 
          user: null, 
          error: 'Google sign-in requires proper OAuth setup with StudyPartner integration' 
        }
      }
      
      // Fallback demo user for local testing
      const demoUser: User = {
        uid: generateUserId(),
        email: 'demo@gmail.com',
        displayName: 'Demo User',
        isFromStudyPartner: false
      }

      setUser(demoUser)
      localStorage.setItem('motivamate-user', JSON.stringify(demoUser))

      setLoading(false)
      toast.info('Demo Google user created locally')
      return { user: demoUser, error: null }
    } catch (error: any) {
      setLoading(false)
      return { user: null, error: 'Failed to sign in with Google' }
    }
  }

  const signOut = async () => {
    setLoading(true)
    
    try {
      // Sign out from StudyPartner if connected
      if (isConnectedToStudyPartner && user?.isFromStudyPartner) {
        await studyPartnerAPI.signOut()
      }
      
      setUser(null)
      localStorage.removeItem('motivamate-user')
      
      setLoading(false)
      return { error: null }
    } catch (error: any) {
      setLoading(false)
      return { error: 'Failed to sign out' }
    }
  }

  const checkConnection = async (): Promise<boolean> => {
    try {
      const connected = await checkStudyPartnerConnection()
      setIsConnectedToStudyPartner(connected)
      return connected
    } catch {
      setIsConnectedToStudyPartner(false)
      return false
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    isConnectedToStudyPartner,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    checkConnection
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}