import { useState, useEffect, useCallback } from 'react'

const THEME_KEY = 'typing-club-theme'
const SOUND_KEY = 'typing-club-sound-mode' // 'off' | 'mechanical' | 'typewriter'

export function useSettings() {
  const [theme, setThemeState] = useState(() => localStorage.getItem(THEME_KEY) || 'light')
  const [soundMode, setSoundModeState] = useState(
    () => localStorage.getItem(SOUND_KEY) || 'mechanical'
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

  return { theme, toggleTheme, soundMode, setSoundMode }
}
