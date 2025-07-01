import { useState, useEffect } from 'react'

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  const toggleVisibility = () => {
    const scrolled = document.documentElement.scrollTop || document.body.scrollTop
    const maxHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
    
    // Button after scrolling 300px
    setIsVisible(scrolled > 300)
    
    // Calculate scroll progress (0-100)
    if (maxHeight > 0) {
      const progress = (scrolled / maxHeight) * 100
      setScrollProgress(Math.min(progress, 100))
    }
  }

  // Smooth scroll to top using API
  const scrollToTop = () => {
    // console.log('Scroll to top clicked') 
    
    // API first
    if ('scrollTo' in window) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    } else {
      // Fallback for older browsers
      const scrollDuration = 800
      const scrollStep = -window.scrollY / (scrollDuration / 15)
      
      const scrollInterval = setInterval(() => {
        if (window.scrollY !== 0) {
          window.scrollBy(0, scrollStep)
        } else {
          clearInterval(scrollInterval)
        }
      }, 15)
    }
  }

  // Scroll events
  useEffect(() => {
    const handleScroll = () => {
      toggleVisibility()
    }

    // Passive listener
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // Initial check
    toggleVisibility()
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Keyboard shortcut (Home key with Ctrl)
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Home' && event.ctrlKey) {
        event.preventDefault()
        scrollToTop()
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [])

  if (!isVisible) {
    return null
  }

  // Calculate stroke dash offset for progress ring
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference

  return (
    <div className="scroll-to-top-container">
      {/* Progress Ring */}
      <svg className="scroll-progress-ring" viewBox="0 0 100 100">
        <circle
          className="progress-ring-bg"
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          opacity="0.2"
        />
        <circle
          className="progress-ring-fill"
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 50 50)"
          style={{
            transition: 'stroke-dashoffset 0.3s ease'
          }}
        />
      </svg>

      {/* Main Button */}
      <button
        className="scroll-to-top-btn"
        onClick={(e) => {
          console.log('Button clicked, event:', e) // Debug log
          e.preventDefault()
          e.stopPropagation()
          scrollToTop()
        }}
        title="Scroll to top (Ctrl+Home)"
        aria-label="Scroll to top"
      >
        <span className="scroll-icon">↑</span>
      </button>

      {/* Percentage Indicator */}
      <div className="scroll-percentage">
        {Math.round(scrollProgress)}%
      </div>
    </div>
  )
}

export default ScrollToTop