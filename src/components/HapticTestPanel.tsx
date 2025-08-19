import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { mobileFeedback, hapticFeedback, audioFeedback, mobileFeedbackWithPreferences } from '@/lib/mobileFeedback'
import { 
  DeviceMobile, 
  SpeakerHigh, 
  Play, 
  Trophy,
  CheckCircle,
  Star,
  Clock,
  Target,
  Vibrate
} from '@phosphor-icons/react'

export function HapticTestPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [lastTested, setLastTested] = useState<string>('')

  const testFeedback = (type: string, action: () => void) => {
    action()
    setLastTested(type)
    setTimeout(() => setLastTested(''), 2000)
  }

  const feedbackTests = [
    {
      name: 'Light Tap',
      description: 'Subtle feedback for button presses',
      icon: <DeviceMobile size={20} />,
      action: () => hapticFeedback.light(),
      color: 'bg-blue-500/20 border-blue-500/40 text-blue-300'
    },
    {
      name: 'Task Complete',
      description: 'Satisfying completion pattern',
      icon: <CheckCircle size={20} />,
      action: () => mobileFeedback.taskComplete(),
      color: 'bg-green-500/20 border-green-500/40 text-green-300'
    },
    {
      name: 'Challenge Task',
      description: 'Extra rewarding challenge completion',
      icon: <Target size={20} />,
      action: () => mobileFeedback.challengeTaskComplete(),
      color: 'bg-purple-500/20 border-purple-500/40 text-purple-300'
    },
    {
      name: 'Study Session',
      description: 'Triumphant session completion',
      icon: <Clock size={20} />,
      action: () => mobileFeedback.studySessionComplete(),
      color: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300'
    },
    {
      name: 'Achievement',
      description: 'Powerful achievement unlock',
      icon: <Trophy size={20} />,
      action: () => mobileFeedback.achievement(),
      color: 'bg-orange-500/20 border-orange-500/40 text-orange-300'
    },
    {
      name: 'Progress Milestone',
      description: 'Gentle progress encouragement',
      icon: <Star size={20} />,
      action: () => mobileFeedback.progressMilestone(),
      color: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
    }
  ]

  const isVibrationSupported = 'vibrate' in navigator
  const isAudioSupported = 'AudioContext' in window

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="bg-black/20 border-white/20 text-white hover:bg-white/10"
        >
          <Vibrate size={16} className="mr-2" />
          Test Haptics
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black/90 backdrop-blur-md border-white/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Vibrate size={24} />
            Haptic Feedback Test
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Test different haptic patterns and sounds on your device
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Device Support Info */}
          <div className="flex gap-2">
            <Badge 
              variant={isVibrationSupported ? "default" : "secondary"}
              className={isVibrationSupported ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}
            >
              <DeviceMobile size={14} className="mr-1" />
              Haptics {isVibrationSupported ? 'Supported' : 'Not Supported'}
            </Badge>
            <Badge 
              variant={isAudioSupported ? "default" : "secondary"}
              className={isAudioSupported ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}
            >
              <SpeakerHigh size={14} className="mr-1" />
              Audio {isAudioSupported ? 'Supported' : 'Not Supported'}
            </Badge>
          </div>

          {/* Test Buttons */}
          <div className="grid gap-3">
            {feedbackTests.map((test) => (
              <Card 
                key={test.name}
                className={`border transition-all duration-200 ${
                  lastTested === test.name 
                    ? 'bg-white/10 border-white/30 scale-[0.98]' 
                    : 'bg-black/20 border-white/10 hover:bg-white/5'
                }`}
              >
                <CardContent className="p-3">
                  <Button
                    onClick={() => testFeedback(test.name, test.action)}
                    className={`w-full justify-start gap-3 h-auto p-3 transition-all duration-200 ${test.color}`}
                    variant="ghost"
                  >
                    <div className="flex items-center gap-3 w-full">
                      {test.icon}
                      <div className="text-left flex-1">
                        <div className="font-medium text-sm">{test.name}</div>
                        <div className="text-xs opacity-70">{test.description}</div>
                      </div>
                      <Play size={16} className="opacity-60" />
                    </div>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Instructions */}
          <Card className="bg-blue-500/10 border-blue-500/30">
            <CardContent className="p-3">
              <div className="text-sm text-blue-200">
                <div className="font-medium mb-1">💡 Testing Tips:</div>
                <ul className="space-y-1 text-xs opacity-90">
                  <li>• Make sure your device isn't on silent mode</li>
                  <li>• Haptics work best on mobile devices</li>
                  <li>• Some patterns combine vibration + sound</li>
                  <li>• Try completing real tasks to feel the feedback!</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Run Full Test */}
          <Button
            onClick={() => testFeedback('Full Test', mobileFeedbackWithPreferences.test)}
            className="w-full bg-accent/20 hover:bg-accent/30 text-accent-foreground border border-accent/40"
            variant="outline"
          >
            <Play size={16} className="mr-2" />
            Run Full Test Sequence
          </Button>
          
          {/* Debug Instructions */}
          <Card className="bg-yellow-500/10 border-yellow-500/30">
            <CardContent className="p-3">
              <div className="text-sm text-yellow-200">
                <div className="font-medium mb-1">🔍 Debug Mode:</div>
                <div className="text-xs opacity-90">
                  Open browser console (F12) to see haptic feedback logs when testing
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}