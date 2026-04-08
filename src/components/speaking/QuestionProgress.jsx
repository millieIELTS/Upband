import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function QuestionProgress({ current, total, onSelect }) {
  return (
    <div className="flex items-center justify-center gap-1 mb-6">
      <button
        onClick={() => onSelect(Math.max(0, current - 1))}
        disabled={current === 0}
        className="p-1 rounded-md text-text-secondary hover:text-primary disabled:opacity-30 transition-colors"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="flex items-center gap-1.5 px-2">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={`transition-all rounded-full ${
              i === current
                ? 'w-6 h-2.5 bg-primary'
                : i < current
                ? 'w-2.5 h-2.5 bg-primary/40 hover:bg-primary/60'
                : 'w-2.5 h-2.5 bg-gray-200 hover:bg-gray-300'
            }`}
            title={`Question ${i + 1}`}
          />
        ))}
      </div>

      <button
        onClick={() => onSelect(Math.min(total - 1, current + 1))}
        disabled={current === total - 1}
        className="p-1 rounded-md text-text-secondary hover:text-primary disabled:opacity-30 transition-colors"
      >
        <ChevronRight size={18} />
      </button>

      <span className="text-xs text-text-secondary ml-2">
        {current + 1} / {total}
      </span>
    </div>
  )
}
