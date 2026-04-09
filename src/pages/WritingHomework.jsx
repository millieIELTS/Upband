import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Send, Loader2, ArrowLeft, Lock, Upload } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { getWritingFeedback } from '../lib/claude'
import { saveWritingSubmission } from '../lib/submissions'
import { supabase } from '../lib/supabase'
import FeedbackDisplay from '../components/writing/FeedbackDisplay'

const taskInfo = {
  task1: {
    title: 'Task 1 제출',
    description: 'Task 1 문제에 대한 리포트를 제출하세요.',
    placeholder: 'Task 1 에세이를 입력하세요...',
    questionPlaceholder: 'Cambridge IELTS 몇 권의 몇 번인지 써주시거나, 없으신 경우 비워두셔도 됩니다. (비워두시면 수치는 정확히 볼 수 없지만 맞다고 생각하고 글만 평가하게 됩니다.)',
    minWords: 150,
  },
  task2: {
    title: 'Task 2 제출',
    description: 'Task 2 문제에 대한 에세이를 제출하세요.',
    placeholder: 'Task 2 에세이를 입력하세요...',
    questionPlaceholder: '문제를 여기에 붙여넣으세요...',
    minWords: 250,
  },
}

export default function WritingHomework() {
  const { taskType } = useParams()
  const info = taskInfo[taskType] || taskInfo.task2
  const [question, setQuestion] = useState('')
  const [essay, setEssay] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [error, setError] = useState('')
  const { user, hasCredits, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const wordCount = essay.split(/\s+/).filter(Boolean).length

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!essay.trim()) return

    if (!user) {
      navigate('/login')
      return
    }

    if (!hasCredits) {
      setError('크레딧이 부족합니다. 크레딧을 충전해주세요.')
      return
    }

    if (taskType === 'task2' && !question.trim()) {
      setError('문제를 입력해주세요.')
      return
    }

    setLoading(true)
    setFeedback(null)
    setError('')

    try {
      // DB에 숙제 저장 (AI 피드백 없이도 저장)
      await saveWritingSubmission(user.id, {
        taskType,
        essay,
        question: question.trim(),
        isHomework: true,
        feedback: { overall_band: null, scores: { task_achievement: null, coherence_cohesion: null, lexical_resource: null, grammatical_range: null } },
      })
      await supabase.rpc('deduct_credit')
      refreshProfile()
      setFeedback({ submitted: true })
    } catch (err) {
      setError(err.message || '제출에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Link
        to="/writing"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-4 no-underline"
      >
        <ArrowLeft size={14} /> Writing 선택으로 돌아가기
      </Link>

      <div className="flex items-center gap-2 mb-1">
        <Upload size={22} className="text-accent" />
        <h1 className="text-2xl font-bold">{info.title}</h1>
      </div>
      <p className="text-text-secondary text-sm mb-6">{info.description}</p>

      {/* 문제 입력 */}
      <div className="bg-surface rounded-xl border border-border p-5 mb-4">
        <h3 className="font-semibold text-sm mb-3">문제 (Question)</h3>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={info.questionPlaceholder}
          className="w-full h-28 p-3 rounded-lg border border-border bg-white resize-y text-sm leading-relaxed focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={essay}
          onChange={(e) => setEssay(e.target.value)}
          placeholder={info.placeholder}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="w-full h-72 p-4 rounded-xl border border-border bg-surface resize-y text-sm leading-relaxed focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />

        <div className="flex items-center justify-between">
          <span className={`text-xs ${wordCount >= info.minWords ? 'text-success' : 'text-text-secondary'}`}>
            {wordCount > 0 ? `${wordCount} / ${info.minWords}+ words` : ''}
          </span>
          <div className="flex items-center gap-3">
            {!user && (
              <span className="text-xs text-text-secondary flex items-center gap-1">
                <Lock size={12} /> 로그인 필요
              </span>
            )}
            <button
              type="submit"
              disabled={loading || !essay.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-accent text-white rounded-lg font-medium text-sm hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {loading ? '분석 중...' : '숙제 제출하기'}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-error/10 text-error text-sm">{error}</div>
      )}

      {feedback?.submitted && (
        <div className="mt-4 p-4 rounded-lg bg-success/10 text-success text-sm font-medium">
          ✅ 숙제가 성공적으로 제출되었습니다! 선생님이 대시보드에서 확인할 수 있습니다.
        </div>
      )}
    </div>
  )
}
