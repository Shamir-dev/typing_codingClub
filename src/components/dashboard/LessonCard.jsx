import { Trophy, BookOpen, Check, Sparkles, Zap, Flame, Lock } from 'lucide-react'
import StarRating from '../shared/StarRating'
import { getBlindModeDisplay, getLessonStarDisplay } from '../../hooks/useProgress'

// Save to: src/components/dashboard/LessonCard.jsx

const DIFFICULTY_STYLE = {
  easy: { Icon: Sparkles, color: 'text-emerald-500', border: 'border-emerald-500/60' },
  medium: { Icon: Zap, color: 'text-amber-500', border: 'border-amber-500/60' },
  hard: { Icon: Flame, color: 'text-red-500', border: 'border-red-500/60' },
}

function BlindModeRow({ label, icon: Icon, display }) {
  if (!display.unlocked) {
    return (
      <div className="flex items-center justify-between py-1">
        <span className="flex items-center gap-1.5 text-[12px] text-text-faint">
          <Icon size={14} className="text-text-faint" />
          {label}
        </span>
        <span className="flex items-center gap-1 text-[12px] text-text-faint">
          <Lock size={11} /> Not Unlocked
        </span>
      </div>
    )
  }

  if (!display.attempted) {
    return (
      <div className="flex items-center justify-between py-1">
        <span className="flex items-center gap-1.5 text-[12px] text-text-muted">
          <Icon size={14} className="text-text-muted" />
          {label}
        </span>
        <span className="text-[12px] text-text-faint">Available</span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between py-1">
      <span className="flex items-center gap-1.5 text-[12px] text-text-muted">
        <Icon size={14} className={display.passed ? 'text-accent-purple' : 'text-red-400'} />
        {label}
      </span>
      <span className="flex items-center gap-2">
        <span className={`text-[12px] font-mono font-semibold ${display.passed ? 'text-emerald-500' : 'text-red-400'}`}>
          {display.accuracy.toFixed(0)}%
        </span>
        <StarRating stars={display.stars} passed={display.passed} size={12} />
      </span>
    </div>
  )
}

export default function LessonCard({ lesson, index, number, progressEntry, onClick }) {
  const isCompleted = !!progressEntry?.completed
  const lessonStars = getLessonStarDisplay(progressEntry)
  const proDisplay = getBlindModeDisplay(progressEntry, 'pro')
  const learnerDisplay = getBlindModeDisplay(progressEntry, 'learner')

  // Defensive numbering: accept `number` directly, fall back to a valid
  // numeric `index`, then to lesson.number/lesson.order if the caller
  // supplies neither, then finally a plain dash rather than "NaN".
  const diffStyle = DIFFICULTY_STYLE[lesson?.difficulty] ?? DIFFICULTY_STYLE.easy
  const DiffIcon = diffStyle.Icon

  const rawNumber = number ?? (typeof index === 'number' ? index + 1 : undefined) ?? lesson?.number ?? lesson?.order
  const displayNumber = typeof rawNumber === 'number' && !Number.isNaN(rawNumber)
    ? String(rawNumber).padStart(2, '0')
    : '—'

  return (
    <button
      onClick={onClick}
      className="w-full self-start text-left rounded-xl border border-line bg-panel hover:border-accent-purple/40 transition-colors p-3.5 flex flex-col min-h-70"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-[13px] font-mono font-bold text-text-faint">
          {displayNumber}
        </span>
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            isCompleted
              ? 'bg-emerald-500/15 text-emerald-500'
              : 'bg-panel-raised text-text-faint'
          }`}
        >
          {isCompleted ? 'Completed' : 'Available'}
        </span>
      </div>

      <div className="flex flex-col items-center text-center mb-2">
        <div
          className={`h-13 w-13 rounded-full flex items-center justify-center mb-2 ${
            isCompleted ? 'bg-amber-400' : `border-2 ${diffStyle.border} bg-panel-raised`
          }`}
        >
          {isCompleted ? (
            <Check size={35} className="text-white" strokeWidth={3} />
          ) : (
            <DiffIcon size={65} className={diffStyle.color} />
          )}
        </div>
        <h3 className="font-semibold text-text text-[14px] leading-snug">{lesson.title}</h3>

        {lessonStars.attempted && (
          <>
            <p className="text-[21px] text-text-faint mt-0.5 flex items-center gap-1.5">
              <span className="text-emerald-500 font-mono">{lessonStars.wpm} WPM</span>
              <span className="text-line">|</span>
              <span>{lessonStars.accuracy?.toFixed(0)}% </span>
            </p>
            <div className="mt-1">
              <StarRating stars={lessonStars.stars} passed={lessonStars.passed} size={17} />
            </div>
          </>
        )}
        {!lessonStars.attempted && (
          <p className="text-[12px] text-text-faint mt-0.5">{lesson.timeTargetSec}s</p>
        )}
      </div>

      <div className=" border-t border-line pt-2 mt-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-faint mb-0.5">
          Blind Test 
        </p>
        <BlindModeRow label="Pro " icon={Trophy} display={proDisplay} />
        <BlindModeRow label="Learner " icon={BookOpen} display={learnerDisplay} />
      </div>
    </button>
  )
}