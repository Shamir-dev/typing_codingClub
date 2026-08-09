export default function Gutter({ lineCount, currentLine }) {
  return (
    <div className="select-none text-right pr-3 border-r border-line font-mono text-sm leading-6">
      {Array.from({ length: lineCount }, (_, i) => (
        <div
          key={i}
          className={i === currentLine ? 'text-text-muted' : 'text-text-faint/50'}
        >
          {i + 1}
        </div>
      ))}
    </div>
  )
}
