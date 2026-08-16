import { oneCompilerSlugs } from '../../content/languages'

export default function CompilerPanel({ language, open, onToggle }) {
  const slug = oneCompilerSlugs[language] || 'python'

  const embedUrl = `https://onecompiler.com/embed/${slug}?theme=dark&hideLanguageSelection=true&hideNew=true&hideNewFileOption=true&hideTitle=true`

  return (
    <section className="mb-6 bg-panel border border-line rounded-md p-4">
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-text-muted font-display font-medium hover:text-text transition-colors"
      >
        {open ? 'Hide' : 'Show'} online compiler
      </button>

      {open && (
        <div className="mt-3 rounded-md overflow-hidden border border-line animate-pop-in">
          <iframe
            src={embedUrl}
            style={{ width: '100%', height: '480px', border: 'none' }}
            title="Online compiler"
          />
        </div>
      )}
    </section>
  )
}