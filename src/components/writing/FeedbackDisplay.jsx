import EssayWithHighlights from './EssayWithHighlights'

export default function FeedbackDisplay({ feedback, taskType, essay }) {
  if (!feedback) return null

  const scoreLabel = taskType === 'task1' ? 'TA' : 'TR'
  const scores = {
    [scoreLabel]: feedback.scores.task_achievement,
    CC: feedback.scores.coherence_cohesion,
    LR: feedback.scores.lexical_resource,
    GRA: feedback.scores.grammatical_range,
  }

  const bandColor = (score) => {
    if (score >= 7) return 'text-band-high'
    if (score >= 6) return 'text-band-mid'
    return 'text-band-low'
  }

  return (
    <div className="mt-8 space-y-6">
      {/* Scores */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-center min-w-16">
            <div className={`text-3xl font-bold ${bandColor(feedback.overall_band)}`}>
              {feedback.overall_band}
            </div>
            <div className="text-xs text-text-secondary">Overall</div>
          </div>
          <div className="flex-1 grid grid-cols-4 gap-3">
            {Object.entries(scores).map(([key, score]) => (
              <div key={key} className="text-center p-2 rounded-lg bg-bg">
                <div className={`text-lg font-semibold ${bandColor(score)}`}>{score}</div>
                <div className="text-xs text-text-secondary">{key}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-sm text-text leading-relaxed">{feedback.summary}</p>
      </div>

      {/* Essay with inline highlights */}
      {essay && feedback.errors?.length > 0 && (
        <div className="bg-surface rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-1">에세이 교정</h3>
          <p className="text-xs text-text-secondary mb-4">하이라이트된 부분을 클릭하면 교정 내용을 볼 수 있습니다.</p>
          <div className="flex gap-3 mb-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-error/20 border border-error/40" /> 문법
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-accent/20 border border-accent/40" /> 어휘
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-primary/20 border border-primary/40" /> 구조/논리
            </span>
          </div>
          <EssayWithHighlights essay={essay} errors={feedback.errors} />
        </div>
      )}

      {/* Criteria Feedback */}
      {feedback.criteria_feedback && (
        <div className="bg-surface rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-4">채점 기준별 피드백</h3>
          <div className="space-y-3">
            {Object.entries(feedback.criteria_feedback).map(([key, text]) => (
              <div key={key} className="p-3 rounded-lg bg-bg">
                <div className="text-xs font-medium text-primary mb-1">
                  {key === 'task_achievement' ? (taskType === 'task1' ? 'Task Achievement' : 'Task Response')
                    : key === 'coherence_cohesion' ? 'Coherence & Cohesion'
                    : key === 'lexical_resource' ? 'Lexical Resource'
                    : 'Grammatical Range & Accuracy'}
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Errors list */}
      {feedback.errors?.length > 0 && (
        <div className="bg-surface rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-4">오류 목록 ({feedback.errors.length}건)</h3>
          <div className="space-y-3">
            {feedback.errors.map((err, i) => (
              <div key={i} className="p-3 rounded-lg bg-bg text-sm">
                <div className="flex items-start gap-2 mb-1 flex-wrap">
                  <span className="text-error line-through">{err.original}</span>
                  <span className="text-text-secondary">→</span>
                  <span className="text-success font-medium">{err.corrected}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    err.category === 'grammar' ? 'bg-error/10 text-error'
                    : err.category === 'vocabulary' ? 'bg-accent/10 text-accent'
                    : 'bg-primary/10 text-primary'
                  }`}>
                    {err.category === 'grammar' ? '문법' : err.category === 'vocabulary' ? '어휘' : '구조'}
                  </span>
                </div>
                <p className="text-text-secondary text-xs">{err.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upgrades */}
      {feedback.upgrades?.length > 0 && (
        <div className="bg-primary/5 rounded-xl border border-primary/20 p-6">
          <h3 className="font-semibold mb-4 text-primary">Band 업그레이드 표현</h3>
          <div className="space-y-3">
            {feedback.upgrades.map((up, i) => (
              <div key={i} className="p-3 rounded-lg bg-surface text-sm">
                <div className="flex items-start gap-2 mb-1 flex-wrap">
                  <span className="text-text-secondary">{up.original}</span>
                  <span className="text-text-secondary">→</span>
                  <span className="text-primary font-medium">{up.upgraded}</span>
                </div>
                <p className="text-text-secondary text-xs">{up.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
