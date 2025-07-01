import { useState, useRef, useEffect } from 'react'

const ThemeMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [theme, setThemeState] = useState('light')
  const [systemTheme, setSystemTheme] = useState('light')
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

  // Get system theme preference
  const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  // Apply theme to document
  const applyTheme = (newTheme) => {
    console.log('Applying theme:', newTheme) // Debug log
    document.documentElement.setAttribute('data-theme', newTheme)
    
    // Update meta theme-color for mobile browsers
    let metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta')
      metaThemeColor.name = 'theme-color'
      document.head.appendChild(metaThemeColor)
    }
    
    const themeColors = {
      light: '#ffffff',
      dark: '#1e293b'
    }
    
    metaThemeColor.setAttribute('content', themeColors[newTheme])
  }

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const currentSystemTheme = getSystemTheme()
    
    setSystemTheme(currentSystemTheme)
    
    // Determine initial theme
    const initialTheme = savedTheme || currentSystemTheme
    
    setThemeState(initialTheme)
    applyTheme(initialTheme)
    
    // Prevent flash of unstyled content
    document.body.classList.add('no-transition')
    setTimeout(() => {
      document.body.classList.remove('no-transition')
    }, 100)
  }, [])

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleSystemThemeChange = (e) => {
      const newSystemTheme = e.matches ? 'dark' : 'light'
      setSystemTheme(newSystemTheme)
      
      // auto-switch if user hasn't set a preference
      if (!localStorage.getItem('theme')) {
        setThemeState(newSystemTheme)
        applyTheme(newSystemTheme)
      }
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }, [])

  // Toggle theme function
  const toggleTheme = () => {
    // console.log('Toggle theme clicked')
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setThemeState(newTheme)
    applyTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  // Set specific theme
  const setTheme = (selectedTheme) => {
    // console.log('Setting theme to:', selectedTheme)
    if (selectedTheme === 'system') {
      localStorage.removeItem('theme')
      const currentSystemTheme = getSystemTheme()
      setThemeState(currentSystemTheme)
      applyTheme(currentSystemTheme)
    } else {
      setThemeState(selectedTheme)
      applyTheme(selectedTheme)
      localStorage.setItem('theme', selectedTheme)
    }
  }

  // Check if current theme matches system
  const isUsingSystemTheme = !localStorage.getItem('theme')
  const isDark = theme === 'dark'

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
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
  }, [theme])

  const themeOptions = [
    {
      value: 'light',
      label: 'Light Mode',
      icon: '☀️',
      description: 'Bright and clean interface'
    },
    {
      value: 'dark',
      label: 'Dark Mode',
      icon: '🌙',
      description: 'Easy on the eyes'
    },
    {
      value: 'system',
      label: 'System',
      icon: '💻',
      description: `Follow system (${systemTheme})`
    }
  ]

  const handleThemeSelect = (selectedTheme) => {
    // console.log('Theme option clicked:', selectedTheme) 
    setTheme(selectedTheme)
    setIsOpen(false)
  }

  const getCurrentThemeOption = () => {
    if (isUsingSystemTheme) {
      return themeOptions.find(option => option.value === 'system')
    }
    return themeOptions.find(option => option.value === theme)
  }

  const currentOption = getCurrentThemeOption()

  return (
    <div className="theme-menu-container">
      {/* Main toggle button */}
      <button
        ref={buttonRef}
        className="theme-toggle"
        onClick={() => {
        //   console.log('Menu toggle clicked') 
          setIsOpen(!isOpen)
        }}
        title="Theme options"
        aria-label="Theme options"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <span className="icon">
          {currentOption?.icon}
        </span>
        
        <span className="theme-indicator">
          {isUsingSystemTheme ? '🔄' : (isDark ? '🌙' : '☀️')}
        </span>
      </button>

      {/* Quick toggle for mobile - double tap */}
      <button
        className="theme-quick-toggle"
        onClick={(e) => {
        //   console.log('Quick toggle clicked')
          e.stopPropagation()
          toggleTheme()
        }}
        title="Quick theme toggle"
        aria-label="Quick theme toggle"
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className="theme-menu"
          role="menu"
          aria-label="Theme selection menu"
        >
          <div className="theme-menu-header">
            <h3>Choose Theme</h3>
            <button
              className="theme-menu-close"
              onClick={(e) => {
                // console.log('Close button clicked') 
                e.stopPropagation()
                setIsOpen(false)
              }}
              aria-label="Close theme menu"
            >
              ✕
            </button>
          </div>

          <div className="theme-options">
            {themeOptions.map((option) => {
              const isSelected = isUsingSystemTheme 
                ? option.value === 'system'
                : option.value === theme
              
              return (
                <button
                  key={option.value}
                  className={`theme-option ${isSelected ? 'selected' : ''}`}
                  onClick={(e) => {
                    // console.log('Theme option button clicked:', option.value)
                    e.stopPropagation()
                    handleThemeSelect(option.value)
                  }}
                  role="menuitem"
                  aria-pressed={isSelected}
                >
                  <div className="theme-option-icon">
                    {option.icon}
                  </div>
                  
                  <div className="theme-option-content">
                    <div className="theme-option-label">
                      {option.label}
                      {isSelected && <span className="selected-indicator">✓</span>}
                    </div>
                    <div className="theme-option-description">
                      {option.description}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="theme-menu-footer">
            <div className="theme-shortcut">
              <span>Keyboard shortcut:</span>
              <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>T</kbd>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="theme-menu-backdrop" 
          onClick={(e) => {
            console.log('Backdrop clicked')
            e.stopPropagation()
            setIsOpen(false)
          }} 
        />
      )}
    </div>
  )
}

export default ThemeMenu