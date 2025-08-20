import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Bell, BellOff, Settings, TestTube } from '@phosphor-icons/react'
import { useState, useEffect } from 'react'
import { notificationManager, initializeNotifications } from '@/lib/notifications'
import { toast } from 'sonner'

export function NotificationSettings() {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [showTestDialog, setShowTestDialog] = useState(false)
  const [testTitle, setTestTitle] = useState('Test Achievement!')
  const [testMessage, setTestMessage] = useState('This is a test notification from MotivaMate')

  useEffect(() => {
    const checkSupport = () => {
      const supported = notificationManager.isNotificationSupported()
      const currentPermission = notificationManager.getPermissionStatus()
      
      setIsSupported(supported)
      setPermission(currentPermission)
    }

    checkSupport()
  }, [])

  const handleRequestPermission = async () => {
    try {
      const initialized = await initializeNotifications()
      if (initialized) {
        const newPermission = await notificationManager.requestPermission()
        setPermission(newPermission)
        
        if (newPermission === 'granted') {
          toast.success('Notifications enabled! You\'ll receive updates for achievements and challenge wins.')
        } else {
          toast.error('Notifications blocked. You can enable them in your browser settings.')
        }
      } else {
        toast.error('Notifications are not supported on this device.')
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      toast.error('Failed to enable notifications.')
    }
  }

  const handleTestNotification = async () => {
    try {
      await notificationManager.showNotification({
        title: testTitle,
        body: testMessage,
        tag: 'test-notification',
        requireInteraction: true,
        actions: [
          {
            action: 'view',
            title: 'View App',
            icon: '/icons/favicon-16x16.png'
          }
        ]
      })
      
      setShowTestDialog(false)
      toast.success('Test notification sent!')
    } catch (error) {
      console.error('Error sending test notification:', error)
      toast.error('Failed to send test notification.')
    }
  }

  const getPermissionBadgeProps = () => {
    switch (permission) {
      case 'granted':
        return { variant: 'default' as const, className: 'bg-green-500/20 text-green-400 border-green-500/30' }
      case 'denied':
        return { variant: 'secondary' as const, className: 'bg-red-500/20 text-red-400 border-red-500/30' }
      default:
        return { variant: 'secondary' as const, className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' }
    }
  }

  const getPermissionText = () => {
    switch (permission) {
      case 'granted':
        return 'Enabled'
      case 'denied':
        return 'Blocked'
      default:
        return 'Not Set'
    }
  }

  if (!isSupported) {
    return (
      <Card className="bg-black/40 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BellOff size={20} />
            Notifications Not Supported
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/60 text-sm">
            Push notifications are not supported on this device or browser. 
            Try using a modern browser like Chrome, Firefox, or Safari.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="bg-black/40 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell size={20} />
            Push Notifications
            <Badge {...getPermissionBadgeProps()} className="ml-auto">
              {getPermissionText()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-white/80 text-sm">
              Get notified when you complete goals or win challenges, even when the app is closed.
            </p>
            
            <div className="space-y-2 text-xs text-white/60">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Goal achievement notifications</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Challenge winner announcements</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Achievement unlock alerts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span>Study streak milestones</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {permission !== 'granted' && (
              <Button
                onClick={handleRequestPermission}
                className="flex-1 bg-accent hover:bg-accent/80 text-accent-foreground"
              >
                <Bell size={16} className="mr-2" />
                Enable Notifications
              </Button>
            )}
            
            {permission === 'granted' && (
              <Button
                onClick={() => setShowTestDialog(true)}
                variant="outline"
                className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/30"
              >
                <TestTube size={16} className="mr-2" />
                Test Notification
              </Button>
            )}
          </div>

          {permission === 'denied' && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">
                <strong>Notifications Blocked:</strong> To enable notifications, click the lock icon in your browser's address bar and allow notifications for this site.
              </p>
            </div>
          )}

          {permission === 'granted' && (
            <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
              <p className="text-green-400 text-sm">
                <strong>Notifications Active:</strong> You'll receive push notifications for goals and achievements even when the app is closed.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Notification Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent className="bg-black/90 backdrop-blur-md border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Test Notification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Notification title"
              value={testTitle}
              onChange={(e) => setTestTitle(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
            
            <Textarea
              placeholder="Notification message"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none h-20"
            />
            
            <div className="flex gap-2">
              <Button
                onClick={() => setShowTestDialog(false)}
                variant="outline"
                className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/30"
              >
                Cancel
              </Button>
              <Button
                onClick={handleTestNotification}
                className="flex-1 bg-accent hover:bg-accent/80 text-accent-foreground"
                disabled={!testTitle.trim() || !testMessage.trim()}
              >
                Send Test
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}