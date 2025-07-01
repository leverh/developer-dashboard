import { useState, useEffect, useCallback } from 'react'

export const useTheme = () => {
  const [theme, setTheme] = useState('light')
  const [systemTheme, setSystemTheme] = useState('light')
  const [isInitialized, setIsInitialized] = useState(false)

  // Get system theme preference
  const getSystemTheme = useCallback(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }, [])

  // Apply theme to document
  const applyTheme = useCallback((newTheme) => {
    document.documentElement.setAttribute('data-theme', newTheme)
    
    // Update meta theme-color - mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (!metaThemeColor) {
      const meta = document.createElement('meta')
      meta.name = 'theme-color'
      document.head.appendChild(meta)
    }
    
    const themeColors = {
      light: '#ffffff',
      dark: '#1e293b'
    }
    
    document.querySelector('meta[name="theme-color"]')
      .setAttribute('content', themeColors[newTheme])
  }, [])

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const currentSystemTheme = getSystemTheme()
    
    setSystemTheme(currentSystemTheme)
    
    // Determine initial theme
    const initialTheme = savedTheme || currentSystemTheme
    
    setTheme(initialTheme)
    applyTheme(initialTheme)
    
    // Prevent flash of unstyled content
    document.body.classList.add('no-transition')
    setTimeout(() => {
      document.body.classList.remove('no-transition')
      setIsInitialized(true)
    }, 100)
  }, [getSystemTheme, applyTheme])

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleSystemThemeChange = (e) => {
      const newSystemTheme = e.matches ? 'dark' : 'light'
      setSystemTheme(newSystemTheme)
      
      // auto-switch if user hasn't set a preference
      if (!localStorage.getItem('theme')) {
        setTheme(newSystemTheme)
        applyTheme(newSystemTheme)
      }
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }, [applyTheme])

  // Toggle theme function
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    applyTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }, [theme, applyTheme])

  // Set specific theme
  const setSpecificTheme = useCallback((newTheme) => {
    if (newTheme === 'system') {
      // Remove saved preference and use system
      localStorage.removeItem('theme')
      const currentSystemTheme = getSystemTheme()
      setTheme(currentSystemTheme)
      applyTheme(currentSystemTheme)
    } else {
      setTheme(newTheme)
      applyTheme(newTheme)
      localStorage.setItem('theme', newTheme)
    }
  }, [getSystemTheme, applyTheme])

  // Reset to system preference
  const resetToSystem = useCallback(() => {
    localStorage.removeItem('theme')
    const currentSystemTheme = getSystemTheme()
    setTheme(currentSystemTheme)
    applyTheme(currentSystemTheme)
  }, [getSystemTheme, applyTheme])

  // Check if current theme = system
  const isUsingSystemTheme = !localStorage.getItem('theme')

  return {
    theme,
    systemTheme,
    isInitialized,
    isUsingSystemTheme,
    toggleTheme,
    setTheme: setSpecificTheme,
    resetToSystem,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  }
}

// Theme context for usage
import { createContext, useContext } from 'react'

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const themeValue = useTheme()
  
  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useThemeContext = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }
  return context
}

// Utility functions
export const getThemeFromStorage = () => {
  return localStorage.getItem('theme')
}

export const getSystemThemePreference = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const addThemeChangeListener = (callback) => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
        const newTheme = document.documentElement.getAttribute('data-theme')
        callback(newTheme)
      }
    })
  })
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  })
  
  return () => observer.disconnect()
}