import { useState, useEffect } from 'react'
import { getRandomQuote, Quote } from '@/lib/quotes'
import { Quote as QuoteIcon } from '@phosphor-icons/react'

export function QuotesBar() {
  const [currentQuote, setCurrentQuote] = useState<Quote>(() => getRandomQuote())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote(getRandomQuote())
    }, 3000) // Change quote every 3 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-t border-white/10 p-3">
      <div className="max-w-md mx-auto flex items-center gap-3">
        <QuoteIcon size={16} className="text-accent flex-shrink-0 mt-1" />
        <div className="flex-1 min-w-0">
          <p 
            className={`text-xs text-white/90 leading-relaxed transition-opacity duration-500 ${
              currentQuote.language === 'ar' ? 'text-right font-medium' : 'text-left'
            }`}
            key={currentQuote.text} // Force re-render for animation
          >
            "{currentQuote.text}"
          </p>
          {currentQuote.author && (
            <p className={`text-xs text-white/60 mt-1 ${
              currentQuote.language === 'ar' ? 'text-right' : 'text-left'
            }`}>
              — {currentQuote.author}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}