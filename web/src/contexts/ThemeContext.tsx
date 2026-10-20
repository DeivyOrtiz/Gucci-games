'use client'

import React, { createContext, useContext, useEffect, useState, useTransition } from 'react'

export type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  isDark: boolean
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = 'gucci_theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)
  const [, startTransition] = useTransition()

  useEffect(() => {
    // Read stored preference or system preference
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
    if (stored === 'light' || stored === 'dark') {
      setThemeState(stored)
      applyThemeToDoc(stored)
    } else {
      // Default to dark for Gucci Games brand, or check system
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const initial = systemDark ? 'dark' : 'dark' // default to dark first
      setThemeState(initial)
      applyThemeToDoc(initial)
    }
    setMounted(true)
  }, [])

  const applyThemeToDoc = (t: Theme) => {
    const root = document.documentElement
    if (t === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
      root.setAttribute('data-theme', 'dark')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
      root.setAttribute('data-theme', 'light')
      root.style.colorScheme = 'light'
    }
  }

  const setTheme = (newTheme: Theme) => {
    startTransition(() => {
      setThemeState(newTheme)
      applyThemeToDoc(newTheme)
      try {
        localStorage.setItem(THEME_STORAGE_KEY, newTheme)
      } catch {
        // ignore localStorage access issues
      }
    })
  }

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
