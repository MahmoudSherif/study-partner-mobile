// Mobile haptic feedback and audio feedback utilities

export const hapticFeedback = {
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
  },
  
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(100)
    }
  },
  
  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(200)
    }
  },
  
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100])
    }
  },
  
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200])
    }
  },
  
  notification: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 50, 50])
    }
  }
}

export const audioFeedback = {
  // Create simple audio tones using Web Audio API
  createTone: (frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (!('AudioContext' in window)) return
    
    const audioContext = new AudioContext()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
    oscillator.type = type
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration / 1000)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + duration / 1000)
  },
  
  success: () => {
    audioFeedback.createTone(523.25, 200) // C5
    setTimeout(() => audioFeedback.createTone(659.25, 200), 100) // E5
  },
  
  error: () => {
    audioFeedback.createTone(311.13, 300) // E♭4
    setTimeout(() => audioFeedback.createTone(233.08, 300), 150) // B♭3
  },
  
  notification: () => {
    audioFeedback.createTone(440, 100) // A4
  },
  
  tick: () => {
    audioFeedback.createTone(800, 50, 'square')
  },
  
  celebration: () => {
    // Play a celebration chord
    audioFeedback.createTone(523.25, 400) // C5
    setTimeout(() => audioFeedback.createTone(659.25, 400), 50) // E5
    setTimeout(() => audioFeedback.createTone(783.99, 400), 100) // G5
    setTimeout(() => audioFeedback.createTone(1046.50, 600), 150) // C6
  }
}

// Combined feedback for different actions
export const mobileFeedback = {
  buttonPress: () => {
    hapticFeedback.light()
    audioFeedback.tick()
  },
  
  taskComplete: () => {
    hapticFeedback.success()
    audioFeedback.success()
  },
  
  achievement: () => {
    hapticFeedback.heavy()
    audioFeedback.celebration()
  },
  
  error: () => {
    hapticFeedback.error()
    audioFeedback.error()
  },
  
  notification: () => {
    hapticFeedback.notification()
    audioFeedback.notification()
  }
}

// Hook for managing feedback preferences
export function useFeedbackPreferences() {
  const getPreference = (key: string, defaultValue: boolean = true): boolean => {
    try {
      const stored = localStorage.getItem(`feedback_${key}`)
      return stored !== null ? JSON.parse(stored) : defaultValue
    } catch {
      return defaultValue
    }
  }
  
  const setPreference = (key: string, value: boolean) => {
    try {
      localStorage.setItem(`feedback_${key}`, JSON.stringify(value))
    } catch {
      // Ignore localStorage errors
    }
  }
  
  return {
    hapticEnabled: getPreference('haptic'),
    audioEnabled: getPreference('audio'),
    setHapticEnabled: (enabled: boolean) => setPreference('haptic', enabled),
    setAudioEnabled: (enabled: boolean) => setPreference('audio', enabled)
  }
}