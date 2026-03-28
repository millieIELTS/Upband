const bandColor = (score) => {
  if (score >= 7) return 'text-band-high'
  if (score >= 6) return 'text-band-mid'
  return 'text-band-low'
}

const scoreLabels = {
  fluency_coherence: 'Fluency & Coherence',
  lexical_resource: 'Lexical Resource',
  grammatical_range: 'Grammar Range',
  // fallback for old format
  Fluency: 'Fluency',
  Lexical: 'Lexical',
  Grammar: 'Grammar',
}

export default function FeedbackResult({ result }) {
  if (!result) return null

  const overall = result.overall_band ?? result.overall
  const scores = result.scores || {}
  const summary = result.summary ?? result.feedback

  return (
    <div className="mt-8 space-y-4">
      {/* Scores */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-center min-w-16">
            <div className={`text-3xl font-bold ${bandColor(overall)}`}>{overall}</div>
            <div className="text-xs text-text-secondary">Overall</div>
          </div>
          <div className="flex-1 grid grid-cols-3 gap-3">
            {Object.entries(scores).map(([key, score]) => (
              <div key={key} className="text-center p-2 rounded-lg bg-bg">
                <div className={`text-lg font-semibold ${bandColor(score)}`}>{score}</div>
                <div className="text-xs text-text-secondary leading-tight">
                  {scoreLabels[key] || key}
                </div>
              </div>
            ))}
          </div>
        </div>
        {summary && <p className="text-sm text-text leading-relaxed">{summary}</p>}
      </div>

      {/* Improvements */}
      {result.improvements?.length > 0 && (
        <div className="bg-surface rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-3">개선 포인트</h3>
          <div className="space-y-2">
            {result.improvements.map((item, i) => (
              <div key={i} className="p-3 rounded-lg bg-bg">
                <p className="text-sm font-medium text-text mb-1">{item.point}</p>
                {item.example && (
                  <p className="text-xs text-text-secondary italic">"{item.example}"</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Model Answer */}
      {(result.model_answer || result.modelAnswer) && (
        <div className="bg-primary/5 rounded-xl border border-primary/20 p-6">
          <h3 className="font-semibold mb-2 text-primary">Band 7+ 모범 답안</h3>
          <p className="text-sm text-text leading-relaxed">
            {result.model_answer || result.modelAnswer}
          </p>
        </div>
      )}
    </div>
  )
}
