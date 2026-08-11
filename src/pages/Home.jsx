import { useNavigate } from 'react-router-dom'
import { Code2, Lock, Sparkles, Type } from 'lucide-react'
import { LANGUAGES } from '../content/languages'
import { AVAILABLE_LANGUAGE_IDS, LESSONS_BY_LANGUAGE } from '../content/allLessons'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 sm:p-14 max-w-5xl mx-auto">
        <div className="mb-12 text-center animate-pop-in">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono mb-5 border"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-js) 22%, transparent)',
              borderColor: 'color-mix(in srgb, var(--color-js) 45%, transparent)',
              color: 'var(--color-text)',
            }}
          >
            <Sparkles size={13} className="animate-soft-pulse" /> typing club
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-text mb-4 tracking-tight">
            Type real code.{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, var(--color-js), var(--color-react), var(--color-python))' }}
            >
              Learn real DSA.
            </span>
          </h1>
          <p className="text-text-muted max-w-lg mx-auto text-[15px]">
            Pick a language to start practicing  short, focused lessons with a review
            section for every one, so you never leave confused about what you just typed.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <button
            onClick={() => navigate('/english')}
            className="card-lift bg-panel border-2 rounded-2xl px-8 py-4 flex items-center gap-4 animate-pop-in"
            style={{
              borderColor: 'color-mix(in srgb, var(--color-js) 40%, transparent)',
              boxShadow: '0 4px 16px -8px color-mix(in srgb, var(--color-js) 50%, transparent)',
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'color-mix(in srgb, var(--color-js) 20%, transparent)' }}
            >
              <Type size={22} style={{ color: 'var(--color-js)' }} />
            </div>
            <div className="text-left">
              <div className="text-sm font-display font-semibold text-text">English Practice</div>
              <div className="text-[11px] font-mono text-text-faint mt-0.5">plain-word typing test</div>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {LANGUAGES.map((lang, i) => {
            const isAvailable = AVAILABLE_LANGUAGE_IDS.includes(lang.id)
            const count = LESSONS_BY_LANGUAGE[lang.id]?.length || 0
            return (
              <button
                key={lang.id}
                disabled={!isAvailable}
                onClick={() => isAvailable && navigate(`/${lang.id}`)}
                style={{
                  animationDelay: `${i * 40}ms`,
                  borderColor: isAvailable ? `${lang.accent}40` : undefined,
                  boxShadow: isAvailable ? `0 4px 16px -8px ${lang.accent}66` : undefined,
                }}
                className={`card-lift relative bg-panel border-2 rounded-2xl p-5 flex flex-col items-center gap-3 text-left animate-pop-in
                  ${!isAvailable ? 'opacity-50 cursor-not-allowed border-line' : 'cursor-pointer'}`}
              >
                {!isAvailable && (
                  <span className="absolute top-3 right-3 text-text-faint">
                    <Lock size={14} />
                  </span>
                )}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-display font-bold"
                  style={{ backgroundColor: `${lang.accent}22`, color: lang.accent }}
                >
                  {lang.name.slice(0, 2)}
                </div>
                <div className="text-center">
                  <div className="text-sm font-display font-semibold text-text">{lang.name}</div>
                  <div className="text-[11px] font-mono text-text-faint mt-0.5">
                    {isAvailable ? `${count} lessons` : 'coming soon'}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}