import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import LessonTyping from './pages/LessonTyping'
import Review from './pages/Review'
import TestResults from './pages/TestResults'
import EnglishTest from './pages/EnglishTest'
import BlindTest from './pages/BlindTest'
import AboutCreator from './pages/AboutCreator'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/results" element={<TestResults />} />
        <Route path="/english" element={<EnglishTest />} />
        <Route path="/about-creator" element={<AboutCreator />} />

        {/* dynamic :languageId routes MUST come after all static routes */}
        <Route path="/:languageId" element={<Dashboard />} />
        <Route path="/:languageId/lesson/:lessonId" element={<LessonTyping />} />
        <Route path="/:languageId/lesson/:lessonId/review" element={<Review />} />
        <Route path="/:languageId/lesson/:lessonId/blind" element={<BlindTest />} />
        <Route path="/:languageId/lesson/:lessonId/blind/:mode" element={<BlindTest />} />
      </Route>
    </Routes>
  )
}