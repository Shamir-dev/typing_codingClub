import { useState, useEffect, useCallback } from 'react'


const THEME_KEY = 'typing-club-theme'
const SOUND_KEY =
  'typing-club-sound-mode' // 'off' | 'mechanical' | 'typewriter' | 'recorded-mechanical'
const CURSOR_KEY = 'typing-club-cursor-style' // 'line' | 'block' | 'underline'
const CURSOR_COLOR_KEY = 'typing-club-cursor-color'
const LEGACY_CURSOR_COLORS_KEY = 'typing-club-cursor-colors'
const DEFAULT_CURSOR_COLOR = '#38bdf8'

export function useSettings() {
  const [theme, setThemeState] = useState(() => localStorage.getItem(THEME_KEY) || 'light')

  const [soundMode, setSoundModeState] = useState(
    () => localStorage.getItem(SOUND_KEY) || 'mechanical'
  )
  const [cursorStyle, setCursorStyleState] = useState(
    () => localStorage.getItem(CURSOR_KEY) || 'line'
  )
  const [cursorColor, setCursorColorState] = useState(() => {
    try {
      const savedColor = localStorage.getItem(CURSOR_COLOR_KEY)
      if (savedColor) return savedColor
      const legacyColors = JSON.parse(localStorage.getItem(LEGACY_CURSOR_COLORS_KEY) || '{}')
      return legacyColors.line || legacyColors.block || legacyColors.underline || DEFAULT_CURSOR_COLOR
    } catch {
      return DEFAULT_CURSOR_COLOR
    }
  })

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

  const setCursorColor = useCallback((color) => {
    localStorage.setItem(CURSOR_COLOR_KEY, color)
    setCursorColorState(color)
  }, [])

  return { theme, toggleTheme, soundMode, setSoundMode, cursorStyle, setCursorStyle, cursorColor, setCursorColor }
}
