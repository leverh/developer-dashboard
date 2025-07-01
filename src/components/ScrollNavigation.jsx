import { useState, useEffect, useRef } from 'react'

const ScrollNavigation = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [currentSection, setCurrentSection] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  // Define sections to navigate to
  const sections = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'stats', label: 'GitHub Stats', icon: '📊' },
    { id: 'deployments', label: 'Deployments', icon: '🚀' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'projects', label: 'Projects', icon: '💼' },
    { id: 'activity', label: 'Activity', icon: '📝' }
  ]

  // Calculate scroll progress and visibility
  const updateScrollState = () => {
    const scrolled = document.documentElement.scrollTop
    const maxHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
    
    // Show after scrolling 200px
    setIsVisible(scrolled > 200)
    
    // Calculate progress
    const progress = maxHeight > 0 ? (scrolled / maxHeight) * 100 : 0
    setScrollProgress(Math.min(progress, 100))
    
    // Determine current section
    const sectionElements = sections.map(section => 
      document.querySelector(`.${section.id}-section`)
    ).filter(Boolean)
    
    let current = ''
    for (let i = sectionElements.length - 1; i >= 0; i--) {
      const rect = sectionElements[i].getBoundingClientRect()
      if (rect.top <= 100) { // 100px offset from top
        current = sections[i]?.id || ''
        break
      }
    }
    setCurrentSection(current)
  }

  // Smooth scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
    setShowMenu(false)
  }

  // Smooth scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.querySelector(`.${sectionId}-section`)
    if (element) {
      const headerOffset = 100 // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
    setShowMenu(false)
  }

  // Scroll to bottom
  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    })
    setShowMenu(false)
  }

  useEffect(() => {
    const handleScroll = () => {
      updateScrollState()
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    updateScrollState() // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.ctrlKey) {
        switch (event.key) {
          case 'Home':
            event.preventDefault()
            scrollToTop()
            break
          case 'End':
            event.preventDefault()
            scrollToBottom()
            break
          case 'ArrowUp':
            if (event.shiftKey) {
              event.preventDefault()
              scrollToTop()
            }
            break
          case 'ArrowDown':
            if (event.shiftKey) {
              event.preventDefault()
              scrollToBottom()
            }
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [])

  if (!isVisible) {
    return null
  }

  return (
    <div className="scroll-navigation" ref={menuRef}>
      {/* Progress Ring */}
      <svg className="scroll-progress-ring" viewBox="0 0 100 100">
        <circle
          className="progress-ring-bg"
          cx="50"
          cy="50"
          r="42"
          fill="none"
          strokeWidth="4"
        />
        <circle
          className="progress-ring-fill"
          cx="50"
          cy="50"
          r="42"
          fill="none"
          strokeWidth="4"
          strokeDasharray={`${2 * Math.PI * 42}`}
          strokeDashoffset={`${2 * Math.PI * 42 * (1 - scrollProgress / 100)}`}
          transform="rotate(-90 50 50)"
        />
      </svg>

      {/* Main Navigation Button */}
      <button
        className="scroll-nav-btn"
        onClick={() => setShowMenu(!showMenu)}
        title="Navigation menu"
        aria-label="Scroll navigation menu"
        aria-expanded={showMenu}
      >
        <span className="nav-icon">
          {showMenu ? '✕' : '⚡'}
        </span>
      </button>

      {/* Quick Actions */}
      <div className={`scroll-quick-actions ${showMenu ? 'visible' : ''}`}>
        <button
          className="quick-action-btn top"
          onClick={scrollToTop}
          title="Scroll to top (Ctrl+Home)"
          aria-label="Scroll to top"
        >
          ↑
        </button>
        
        <button
          className="quick-action-btn bottom"
          onClick={scrollToBottom}
          title="Scroll to bottom (Ctrl+End)"
          aria-label="Scroll to bottom"
        >
          ↓
        </button>
      </div>

      {/* Navigation Menu */}
      {showMenu && (
        <>
          <div className="scroll-menu">
            <div className="scroll-menu-header">
              <h4>Navigate to Section</h4>
              <div className="scroll-progress-text">
                {Math.round(scrollProgress)}% scrolled
              </div>
            </div>
            
            <div className="scroll-menu-sections">
              {sections.map((section) => (
                <button
                  key={section.id}
                  className={`scroll-menu-item ${currentSection === section.id ? 'active' : ''}`}
                  onClick={() => scrollToSection(section.id)}
                >
                  <span className="section-icon">{section.icon}</span>
                  <span className="section-label">{section.label}</span>
                  {currentSection === section.id && (
                    <span className="current-indicator">●</span>
                  )}
                </button>
              ))}
            </div>

            <div className="scroll-menu-footer">
              <div className="scroll-shortcuts">
                <span>Shortcuts:</span>
                <div className="shortcut-group">
                  <kbd>Ctrl</kbd> + <kbd>Home</kbd> - Top
                </div>
                <div className="shortcut-group">
                  <kbd>Ctrl</kbd> + <kbd>End</kbd> - Bottom
                </div>
              </div>
            </div>
          </div>
          
          <div className="scroll-menu-backdrop" onClick={() => setShowMenu(false)} />
        </>
      )}

      {/* Progress Indicator */}
      <div className="scroll-progress-indicator">
        {Math.round(scrollProgress)}%
      </div>
    </div>
  )
}

export default ScrollNavigation