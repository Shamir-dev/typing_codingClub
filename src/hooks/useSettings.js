import { useState, useEffect, useCallback } from 'react'

const THEME_KEY = 'typing-club-theme'
const SOUND_KEY = 'typing-club-sound-mode' // 'off' | 'mechanical' | 'typewriter'
const CURSOR_KEY = 'typing-club-cursor-style' // 'line' | 'block' | 'underline'

export function useSettings() {
  const [theme, setThemeState] = useState(() => localStorage.getItem(THEME_KEY) || 'light')
  const [soundMode, setSoundModeState] = useState(
    () => localStorage.getItem(SOUND_KEY) || 'mechanical'
  )
  const [cursorStyle, setCursorStyleState] = useState(
    () => localStorage.getItem(CURSOR_KEY) || 'line'
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem(THEME_KEY, next)
      return next
    })
  }, [])

  const setSoundMode = useCallback((mode) => {
    localStorage.setItem(SOUND_KEY, mode)
    setSoundModeState(mode)
  }, [])

  const setCursorStyle = useCallback((style) => {
    localStorage.setItem(CURSOR_KEY, style)
    setCursorStyleState(style)
  }, [])

  return { theme, toggleTheme, soundMode, setSoundMode, cursorStyle, setCursorStyle }
}