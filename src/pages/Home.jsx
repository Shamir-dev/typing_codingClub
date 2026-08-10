import { Code2, Lock } from 'lucide-react'
import { LANGUAGES } from '../content/languages'

export default function Home({ onSelectLanguage }) {
  return (
    <div className="p-8 sm:p-12 max-w-5xl mx-auto">
      <div className="mb-10 text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono mb-4"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-js) 18%, transparent)', color: 'var(--color-text)' }}
        >
          <Code2 size={14} /> Pro Coder club
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-text mb-3">
          Type real code. Learn real DSA.
        </h1>
        <p className="text-text-muted max-w-lg mx-auto">
          Pick a language to start practicing — short, focused lessons with a review
          section for every one, so you never leave confused about what you just typed.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.id}
            disabled={!lang.available}
            onClick={() => lang.available && onSelectLanguage(lang.id)}
            className={`card-lift relative bg-panel border border-line rounded-2xl p-5 flex flex-col items-center gap-3 text-left
              ${!lang.available ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ boxShadow: '0 2px 10px -6px rgba(0,0,0,0.15)' }}
          >
            {!lang.available && (
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
                {lang.available ? `${lang.trackType} track` : 'coming soon'}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
