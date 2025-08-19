import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Quote } from '@phosphor-icons/react'

interface Character {
  id: string
  name: string
  field: string
  achievements: string[]
  quote: string
  imageType: 'portrait' | 'work' // portrait for men, work/symbol for women
  imageDescription: string // What the image represents
}

const inspirationalCharacters: Character[] = [
  {
    id: '1',
    name: 'Albert Einstein',
    field: 'Theoretical Physics',
    achievements: [
      'Developed the theory of relativity',
      'Explained the photoelectric effect',
      'Nobel Prize in Physics (1921)'
    ],
    quote: 'Imagination is more important than knowledge.',
    imageType: 'portrait',
    imageDescription: 'Portrait of Einstein'
  },
  {
    id: '2',
    name: 'Marie Curie',
    field: 'Physics & Chemistry',
    achievements: [
      'First woman to win a Nobel Prize',
      'Discovered radium and polonium',
      'Pioneer in radioactivity research'
    ],
    quote: 'In science, we must be interested in things, not in persons.',
    imageType: 'work',
    imageDescription: 'Laboratory equipment and radium samples'
  },
  {
    id: '3',
    name: 'Leonardo da Vinci',
    field: 'Renaissance Polymath',
    achievements: [
      'Created the Mona Lisa and The Last Supper',
      'Designed flying machines and inventions',
      'Advanced anatomy and engineering'
    ],
    quote: 'Learning never exhausts the mind.',
    imageType: 'portrait',
    imageDescription: 'Self-portrait of da Vinci'
  },
  {
    id: '4',
    name: 'Rosa Parks',
    field: 'Civil Rights',
    achievements: [
      'Sparked Montgomery Bus Boycott',
      'Became symbol of civil rights movement',
      'Received Presidential Medal of Freedom'
    ],
    quote: 'You must never be fearful about what you are doing when it is right.',
    imageType: 'work',
    imageDescription: 'Historic Montgomery bus and civil rights symbols'
  },
  {
    id: '5',
    name: 'Stephen Hawking',
    field: 'Theoretical Physics',
    achievements: [
      'Explained black hole radiation',
      'Authored "A Brief History of Time"',
      'Advanced our understanding of cosmology'
    ],
    quote: 'Intelligence is the ability to adapt to change.',
    imageType: 'portrait',
    imageDescription: 'Portrait of Hawking'
  },
  {
    id: '6',
    name: 'Katherine Johnson',
    field: 'Mathematics & Space Science',
    achievements: [
      'Calculated trajectories for NASA missions',
      'Enabled first US crewed spaceflights',
      'Depicted in "Hidden Figures" film'
    ],
    quote: 'Like what you do, and then you will do your best.',
    imageType: 'work',
    imageDescription: 'Mathematical calculations and spacecraft trajectories'
  },
  {
    id: '7',
    name: 'Nikola Tesla',
    field: 'Electrical Engineering',
    achievements: [
      'Invented alternating current (AC)',
      'Developed wireless technology',
      'Created the Tesla coil'
    ],
    quote: 'The present is theirs; the future, for which I really worked, is mine.',
    imageType: 'portrait',
    imageDescription: 'Portrait of Tesla'
  },
  {
    id: '8',
    name: 'Frida Kahlo',
    field: 'Art & Culture',
    achievements: [
      'Created over 140 self-portraits',
      'Became icon of Mexican culture',
      'Advocated for indigenous rights'
    ],
    quote: 'I paint my own reality.',
    imageType: 'work',
    imageDescription: 'Colorful Mexican art and self-portrait elements'
  }
]

export function InspirationCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-scroll functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % inspirationalCharacters.length)
    }, 5000) // Change every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const currentCharacter = inspirationalCharacters[currentIndex]

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-2">Daily Inspiration</h2>
        <p className="text-white/70 text-sm">Learn from history's greatest minds</p>
      </div>

      <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white overflow-hidden">
        <CardContent className="p-0">
          {/* Character Image Placeholder */}
          <div className="h-48 bg-gradient-to-br from-primary/30 to-accent/30 relative flex items-center justify-center">
            <div className="text-center p-4">
              <div className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-3 flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl font-bold text-white">
                  {currentCharacter.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="text-xs text-white/60 italic">
                {currentCharacter.imageDescription}
              </div>
            </div>
            
            {/* Progress indicators */}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {inspirationalCharacters.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Character Info */}
          <div className="p-6 space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white">{currentCharacter.name}</h3>
              <Badge variant="secondary" className="mt-1 bg-white/20 text-white border-white/30">
                {currentCharacter.field}
              </Badge>
            </div>

            {/* Achievements */}
            <div className="space-y-2">
              <h4 className="font-semibold text-white/90">Key Achievements:</h4>
              <ul className="space-y-1">
                {currentCharacter.achievements.map((achievement, index) => (
                  <li key={index} className="text-sm text-white/80 flex items-start gap-2">
                    <span className="text-accent mt-1">•</span>
                    {achievement}
                  </li>
                ))}
              </ul>
            </div>

            {/* Quote */}
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-start gap-3">
                <Quote size={20} className="text-accent mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white/90 italic text-sm leading-relaxed">
                    "{currentCharacter.quote}"
                  </p>
                  <p className="text-white/60 text-xs mt-2">
                    — {currentCharacter.name}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manual navigation */}
      <div className="flex justify-center space-x-2">
        <button
          onClick={() => setCurrentIndex((prev) => 
            prev === 0 ? inspirationalCharacters.length - 1 : prev - 1
          )}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm backdrop-blur-sm border border-white/20"
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % inspirationalCharacters.length)}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm backdrop-blur-sm border border-white/20"
        >
          Next
        </button>
      </div>

      {/* Character counter */}
      <div className="text-center text-white/60 text-xs">
        {currentIndex + 1} of {inspirationalCharacters.length}
      </div>
    </div>
  )
}