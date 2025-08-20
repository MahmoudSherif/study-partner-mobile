import { useState, useEffect } from 'react'
import { CloudCheck, CloudX, CloudArrowUp } from '@phosphor-icons/react'
import { dataSyncService } from '@/lib/dataSync'
import { useAuth } from '@/contexts/AuthContext'

export const SyncIndicator = () => {
  const { user } = useAuth()
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'offline'>('synced')
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  useEffect(() => {
    if (!user) {
      setSyncStatus('offline')
      return
    }

    // Listen for sync events
    const handleDataSync = () => {
      setSyncStatus('synced')
      setLastSyncTime(new Date())
    }

    const handleSyncStart = () => {
      setSyncStatus('syncing')
    }

    const handleSyncError = () => {
      setSyncStatus('error')
    }

    // Add event listeners
    window.addEventListener('dataSync', handleDataSync)
    window.addEventListener('syncStart', handleSyncStart)
    window.addEventListener('syncError', handleSyncError)

    // Set initial sync time
    const lastSync = localStorage.getItem('lastSyncAt')
    if (lastSync) {
      setLastSyncTime(new Date(lastSync))
    }

    return () => {
      window.removeEventListener('dataSync', handleDataSync)
      window.removeEventListener('syncStart', handleSyncStart)
      window.removeEventListener('syncError', handleSyncError)
    }
  }, [user])

  if (!user) return null

  const getIcon = () => {
    switch (syncStatus) {
      case 'synced':
        return <CloudCheck size={16} className="text-green-400" />
      case 'syncing':
        return <CloudArrowUp size={16} className="text-blue-400 animate-pulse" />
      case 'error':
        return <CloudX size={16} className="text-red-400" />
      default:
        return <CloudX size={16} className="text-gray-400" />
    }
  }

  const getStatusText = () => {
    switch (syncStatus) {
      case 'synced':
        return lastSyncTime ? `Synced ${formatTimeAgo(lastSyncTime)}` : 'Synced'
      case 'syncing':
        return 'Syncing...'
      case 'error':
        return 'Sync failed'
      case 'offline':
        return 'Offline'
      default:
        return 'Unknown'
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
      <div className="flex items-center gap-2">
        {getIcon()}
        <span className="text-xs text-white/80">{getStatusText()}</span>
      </div>
    </div>
  )
}