import { X } from 'lucide-react'
import { oneCompilerSlugs } from '../../content/languages'

export default function CompilerModal({ language, onClose }) {
  if (!language) return null

  const slug = oneCompilerSlugs[language] || 'python'
  const embedUrl = `https://onecompiler.com/embed/${slug}?theme=dark&hideLanguageSelection=true&hideNew=true&hideNewFileOption=true&hideTitle=true`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-xl border border-line bg-panel shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <span className="text-xs uppercase tracking-wider text-text-muted font-display font-medium">
            Online compiler
          </span>
          <button
            onClick={onClose}
            title="Close"
            className="text-text-faint hover:text-text p-1 rounded-md hover:bg-panel-raised transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <iframe
          src={embedUrl}
          style={{ width: '100%', height: '560px', border: 'none', display: 'block' }}
          title="Online compiler"
        />
      </div>
    </div>
  )
}