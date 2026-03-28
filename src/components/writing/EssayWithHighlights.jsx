import { useState } from 'react'

export default function EssayWithHighlights({ essay, errors }) {
  const [activeError, setActiveError] = useState(null)

  if (!errors?.length) {
    return <p className="text-sm leading-relaxed whitespace-pre-wrap text-text">{essay}</p>
  }

  // Build highlighted text by finding error positions
  const parts = []
  let remaining = essay
  let offset = 0

  // Sort errors by their position in the essay
  const sortedErrors = [...errors]
    .map((err, i) => ({ ...err, index: i }))
    .sort((a, b) => {
      const posA = essay.toLowerCase().indexOf(a.original.toLowerCase())
      const posB = essay.toLowerCase().indexOf(b.original.toLowerCase())
      return posA - posB
    })

  for (const err of sortedErrors) {
    const pos = remaining.toLowerCase().indexOf(err.original.toLowerCase())
    if (pos === -1) continue

    // Text before the error
    if (pos > 0) {
      parts.push({ type: 'text', content: remaining.slice(0, pos) })
    }

    // The error itself
    parts.push({
      type: 'error',
      content: remaining.slice(pos, pos + err.original.length),
      error: err,
    })

    remaining = remaining.slice(pos + err.original.length)
    offset += pos + err.original.length
  }

  // Remaining text
  if (remaining) {
    parts.push({ type: 'text', content: remaining })
  }

  return (
    <div>
      <div className="text-sm leading-relaxed whitespace-pre-wrap text-text">
        {parts.map((part, i) =>
          part.type === 'text' ? (
            <span key={i}>{part.content}</span>
          ) : (
            <span
              key={i}
              className={`cursor-pointer border-b-2 transition-colors ${
                part.error.category === 'grammar'
                  ? 'border-error/60 bg-error/5 hover:bg-error/10'
                  : part.error.category === 'vocabulary'
                  ? 'border-accent/60 bg-accent/5 hover:bg-accent/10'
                  : 'border-primary/60 bg-primary/5 hover:bg-primary/10'
              }`}
              onClick={() =>
                setActiveError(activeError?.index === part.error.index ? null : part.error)
              }
            >
              {part.content}
            </span>
          )
        )}
      </div>

      {activeError && (
        <div className="mt-3 p-3 rounded-lg border border-border bg-bg text-sm animate-in fade-in">
          <div className="flex items-start gap-2 mb-1">
            <span className="text-error line-through">{activeError.original}</span>
            <span className="text-text-secondary">→</span>
            <span className="text-success font-medium">{activeError.corrected}</span>
          </div>
          <p className="text-text-secondary text-xs mt-1">{activeError.explanation}</p>
        </div>
      )}
    </div>
  )
}
