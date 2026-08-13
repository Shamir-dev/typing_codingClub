import { useNavigate, useOutletContext } from 'react-router-dom'
import { Type, Zap, ArrowRight, Languages, BookOpen, ClipboardCheck } from 'lucide-react'
import { LANGUAGES } from '../content/languages'
import { AVAILABLE_LANGUAGE_IDS, LESSONS_BY_LANGUAGE } from '../content/allLessons'
import LanguageCard from '../components/home/LanguageCard'
import ContinuePracticing from '../components/home/ContinuePracticing'
import RecentTests from '../components/home/RecentTests'
import WeeklyActivityChart from '../components/home/WeeklyActivityChart'
import DailyGoal from '../components/home/DailyGoal'
import HeroWave from '../components/home/HeroWave'

export default function Home() {
  const navigate = useNavigate()
  const { progress, attempts } = useOutletContext()

  const totalLessons = Object.values(LESSONS_BY_LANGUAGE).reduce((sum, arr) => sum + arr.length, 0)
  const testsTaken = attempts.length

  return (
    <div className="flex-1 overflow-auto">
      <div className="relative px-5 pb-8 sm:px-10 max-w-[1280px] mx-auto w-full">
        {/* Hero */}
        <div className="relative mb-8 min-h-[250px] flex items-center animate-pop-in">
          <div className="hero-grid-bg" />
          <div className="hero-glow" />
          <HeroWave />

          <div className="relative max-w-xl">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono mb-5 border"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-accent-purple) 15%, transparent)',
                borderColor: 'color-mix(in srgb, var(--color-accent-purple) 40%, transparent)',
                color: 'var(--color-text)',
              }}
            >
              <Zap size={13} className="animate-soft-pulse" /> ProCoder
            </div>
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-[3.25rem] leading-[1.05] text-text mb-4 tracking-tight">
              Type real code.{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(90deg, var(--color-accent-blue), var(--color-accent-purple))' }}
              >
                Learn real DSA.
              </span>
            </h1>
            <p className="text-text-muted max-w-lg text-[15px] leading-relaxed mb-7">
              Pick a language to start practicing — short, focused lessons with a review
              section for every one, so you never leave confused about what you just typed.
            </p>

            <div className="flex items-center gap-6 sm:gap-8 flex-wrap">
              {[
                { label: 'Languages', value: LANGUAGES.length, Icon: Languages },
                { label: 'Lessons', value: `${totalLessons}+`, Icon: BookOpen },
                { label: 'Tests Taken', value: testsTaken, Icon: ClipboardCheck },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2.5">
                  <stat.Icon size={19} className="text-accent-purple" />
                  <div><div className="font-display font-semibold text-base text-text">{stat.value}</div><div className="text-[10px] uppercase tracking-wide text-text-faint">{stat.label}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* English Practice */}
        <button
          onClick={() => navigate('/english')}
          className="card-lift group ml-auto max-w-[320px] sm:-mt-24 relative w-full bg-panel border rounded-2xl px-5 py-4 flex items-center gap-4 mb-6 animate-pop-in text-left"
          style={{ borderColor: 'color-mix(in srgb, var(--color-accent-purple) 35%, var(--color-line))' }}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent-purple) 18%, transparent)' }}
          >
            <Type size={20} style={{ color: 'var(--color-accent-purple)' }} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-display font-semibold text-text">English Practice</div>
            <div className="text-[11px] font-mono text-text-faint mt-0.5">Plain-word typing test</div>
          </div>
          <ArrowRight size={16} className="text-text-faint transition-transform group-hover:translate-x-1 group-hover:text-text" />
        </button>

        {/* Language grid */}
        <div className="grid grid-cols-1 min-[560px]:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {LANGUAGES.map((lang, i) => {
            const isAvailable = AVAILABLE_LANGUAGE_IDS.includes(lang.id)
            const lessons = LESSONS_BY_LANGUAGE[lang.id] || []
            const completed = lessons.filter((l) => progress?.[l.id]?.completed).length
            const progressPct = lessons.length ? Math.round((completed / lessons.length) * 100) : 0

            return (
              <LanguageCard
                key={lang.id}
                lang={lang}
                isAvailable={isAvailable}
                lessonCount={lessons.length}
                progressPct={progressPct}
                delayMs={i * 40}
                onClick={() => navigate(`/${lang.id}`)}
              />
            )
          })}
        </div>

        {/* Secondary dashboard — only real, derivable data */}
        {attempts.length > 0 && (
          <div className="grid grid-cols-1 min-[680px]:grid-cols-2 xl:grid-cols-4 gap-4">
            <ContinuePracticing attempts={attempts} />
            <WeeklyActivityChart attempts={attempts} />
            <RecentTests attempts={attempts} />
            <DailyGoal attempts={attempts} />
          </div>
        )}
      </div>
    </div>
  )
}
