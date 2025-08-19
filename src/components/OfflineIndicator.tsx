import { useState, useEffect } from 'react'
import { WifiSlash, Wifi } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowIndicator(true)
      toast.success('Back online! 🌐', {
        duration: 3000
      })
      
      // Hide indicator after showing "back online" message
      setTimeout(() => setShowIndicator(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowIndicator(true)
      toast.error('You are offline 📱', {
        description: 'Some features may be limited',
        duration: 5000
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Show indicator initially if offline
    if (!navigator.onLine) {
      setShowIndicator(true)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!showIndicator || isOnline) return null

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-500/90 backdrop-blur-sm rounded-full px-4 py-2 border border-red-400/50 animate-pulse">
      <div className="flex items-center gap-2 text-white text-sm font-medium">
        <WifiSlash size={16} />
        <span>Offline Mode</span>
      </div>
    </div>
  )
}