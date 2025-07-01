import { useState, useEffect } from 'react'

const ThemeToggle = () => {
  const [theme, setTheme] = useState('light')
  const [isAnimating, setIsAnimating] = useState(false)

  // Initialize theme on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const initialTheme = savedTheme || systemPreference

    setTheme(initialTheme)
    applyTheme(initialTheme)

    // Prevent transitions on load
    document.body.classList.add('no-transition')
    setTimeout(() => {
      document.body.classList.remove('no-transition')
    }, 100)
  }, [])

  const applyTheme = (newTheme) => {
    document.documentElement.setAttribute('data-theme', newTheme)

    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', newTheme === 'dark' ? '#1e293b' : '#ffffff')
    }
  }

  const toggleTheme = () => {
    if (isAnimating) return

    setIsAnimating(true)
    const newTheme = theme === 'light' ? 'dark' : 'light'
    
    // Page flash effect
    document.body.style.transition = 'opacity 0.3s ease-in-out'
    document.body.style.opacity = '0.95'
    
    setTimeout(() => {
      setTheme(newTheme)
      applyTheme(newTheme)
      localStorage.setItem('theme', newTheme)
      
      // Reset page opacity
      document.body.style.opacity = '1'
      
      setTimeout(() => {
        document.body.style.transition = ''
        setIsAnimating(false)
      }, 300)
    }, 150)
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light'
        setTheme(newTheme)
        applyTheme(newTheme)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Keyboard shortcut (Ctrl/Cmd + Shift + T)
  useEffect(() => {
    const handleKeyboard = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault()
        toggleTheme()
      }
    }

    document.addEventListener('keydown', handleKeyboard)
    return () => document.removeEventListener('keydown', handleKeyboard)
  }, [theme, isAnimating])

  return (
    <>
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        disabled={isAnimating}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode (Ctrl+Shift+T)`}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        <span className={`icon ${isAnimating ? 'rotate' : ''}`}>
          {theme === 'light' ? '🌙' : '☀️'}
        </span>
        
        <span className="theme-indicator">
          {theme === 'light' ? '☀️' : '🌙'}
        </span>
      </button>

      {/* Theme status for screen readers */}
      <div 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {theme === 'light' ? 'Light mode active' : 'Dark mode active'}
      </div>
    </>
  )
}

export default ThemeToggle