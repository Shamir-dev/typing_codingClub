import { useState, useMemo } from 'react'
import Sidebar from './components/layout/Sidebar'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import LessonTyping from './pages/LessonTyping'
import Review from './pages/Review'
import { getLanguage } from './content/languages'
import { useProgress } from './hooks/useProgress'
import { useSettings } from './hooks/useSettings'
import { useAttemptsLog } from './hooks/useAttemptsLog'
import javascriptLessons from './content/javascript/lessons.json'

const LESSONS_BY_LANGUAGE = {
  javascript: javascriptLessons,
}

// view: { name: 'home' } | { name: 'dashboard' } | { name: 'typing', lesson } | { name: 'review', lesson, result }
export default function App() {
  const [languageId, setLanguageId] = useState('javascript')
  const [view, setView] = useState({ name: 'home' })
  const { progress, recordCompletion } = useProgress()
  const { theme, toggleTheme, soundMode, setSoundMode } = useSettings()
  const { attemptsForLanguage, logAttempt } = useAttemptsLog()

  const language = getLanguage(languageId)
  const lessons = useMemo(() => LESSONS_BY_LANGUAGE[languageId] || [], [languageId])

  function handleSelectLanguage(id) {
    setLanguageId(id)
    setView({ name: 'dashboard' })
  }

  function handleSelectLesson(lesson) {
    setView({ name: 'typing', lesson })
  }

  function handleComplete(lesson, result) {
    recordCompletion(lesson.id, { wpm: result.wpm, accuracy: result.accuracy })
    logAttempt({
      lessonId: lesson.id,
      language: languageId,
      difficulty: lesson.difficulty,
      wpm: result.wpm,
      accuracy: result.accuracy,
      timeMs: result.timeMs,
      isPerfect: result.isPerfect,
    })
    setView({ name: 'review', lesson, result })
  }

  return (
    <div className="h-screen w-screen flex bg-base text-text">
      <Sidebar
        activeLanguageId={view.name === 'home' ? null : languageId}
        onSelectLanguage={handleSelectLanguage}
        onGoHome={() => setView({ name: 'home' })}
        theme={theme}
        onToggleTheme={toggleTheme}
        soundMode={soundMode}
        onSetSoundMode={setSoundMode}
      />

      <main className="flex-1 h-full overflow-hidden flex flex-col">
        {view.name === 'home' && (
          <div className="flex-1 overflow-auto">
            <Home onSelectLanguage={handleSelectLanguage} />
          </div>
        )}

        {view.name === 'dashboard' && (
          <div className="flex-1 overflow-auto">
            <Dashboard
              language={language}
              lessons={lessons}
              progress={progress}
              attempts={attemptsForLanguage(languageId)}
              onSelectLesson={handleSelectLesson}
            />
          </div>
        )}

        {view.name === 'typing' && (
          <LessonTyping
            lesson={view.lesson}
            accent={language.accent}
            soundMode={soundMode}
            onComplete={(result) => handleComplete(view.lesson, result)}
            onBack={() => setView({ name: 'dashboard' })}
          />
        )}

        {view.name === 'review' && (
          <div className="flex-1 overflow-auto">
            <Review
              lesson={view.lesson}
              result={view.result}
              accent={language.accent}
              onRetry={() => setView({ name: 'typing', lesson: view.lesson })}
              onBack={() => setView({ name: 'dashboard' })}
            />
          </div>
        )}
      </main>
    </div>
  )
}
