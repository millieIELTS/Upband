import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Send, Loader2, ArrowLeft, Lock, RotateCcw } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useStreak } from '../hooks/useStreak'
import { getWritingFeedback } from '../lib/claude'
import { supabase } from '../lib/supabase'
import FeedbackDisplay from '../components/writing/FeedbackDisplay'
import Task1Chart from '../components/writing/Task1Chart'

const task1Questions = [
  {
    prompt: 'The bar chart below shows the number of students enrolled in three different courses at a university between 2015 and 2020.',
    instruction: 'Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
  },
  {
    prompt: 'The pie charts below show the percentage of energy produced from different sources in a country in 1985 and 2010.',
    instruction: 'Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
  },
  {
    prompt: 'The line graph below shows the average monthly temperatures in three major cities over the course of a year.',
    instruction: 'Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
  },
  {
    prompt: 'The table below shows the proportion of household income spent on different categories in five countries.',
    instruction: 'Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
  },
]

const task2Questions = [
  {
    prompt: 'Some people believe that universities should focus on providing academic skills, while others think they should prepare students for employment. Discuss both views and give your own opinion.',
    instruction: 'Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.',
  },
  {
    prompt: 'In many countries, the gap between the rich and the poor is increasing. What problems does this cause? What solutions can you suggest?',
    instruction: 'Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.',
  },
  {
    prompt: 'Some people think that the best way to reduce crime is to give longer prison sentences. Others, however, believe there are better alternative ways of reducing crime. Discuss both views and give your opinion.',
    instruction: 'Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.',
  },
  {
    prompt: 'Nowadays many people choose to be self-employed, rather than to work for a company or organisation. Why might this be the case? What could be the disadvantages of being self-employed?',
    instruction: 'Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.',
  },
]

const taskInfo = {
  task1: {
    title: 'Writing Task 1',
    description: '그래프/차트/표를 설명하는 리포트',
    placeholder: 'Task 1 에세이를 입력하세요...',
    minWords: 150,
    questions: task1Questions,
  },
  task2: {
    title: 'Writing Task 2',
    description: '주제에 대한 의견 에세이',
    placeholder: 'Task 2 에세이를 입력하세요...',
    minWords: 250,
    questions: task2Questions,
  },
}

export default function WritingTask() {
  const { taskType } = useParams()
  const info = taskInfo[taskType] || taskInfo.task2
  const [questionIndex, setQuestionIndex] = useState(0)
  const [essay, setEssay] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [error, setError] = useState('')
  const { user, hasCredits, refreshProfile } = useAuth()
  const { recordActivity } = useStreak()
  const navigate = useNavigate()

  const question = info.questions[questionIndex]
  const wordCount = essay.split(/\s+/).filter(Boolean).length

  const nextQuestion = () => {
    setQuestionIndex((prev) => (prev + 1) % info.questions.length)
    setEssay('')
    setFeedback(null)
    setError('')
  }

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

    setLoading(true)
    setFeedback(null)
    setError('')

    try {
      const result = await getWritingFeedback({ essay, taskType })
      setFeedback(result)
      // AI 피드백 성공 시 크레딧 1 차감 (daily_credits 우선 차감)
      await supabase.rpc('consume_credits', { p_amount: 1 })
      refreshProfile()
      recordActivity('writing') // 🔥 스트릭 + 활동 로그
    } catch (err) {
      setError(err.message)
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
        <ArrowLeft size={14} /> Task 선택으로 돌아가기
      </Link>

      <h1 className="text-2xl font-bold mb-1">{info.title}</h1>
      <p className="text-text-secondary text-sm mb-6">{info.description}</p>

      {/* Question prompt */}
      <div className="bg-surface rounded-xl border border-border p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Question</h3>
          <button onClick={nextQuestion} className="text-xs text-text-secondary hover:text-primary flex items-center gap-1">
            <RotateCcw size={12} /> 다른 문제
          </button>
        </div>
        <p className="text-sm text-text leading-relaxed mb-3">{question.prompt}</p>
        {taskType === 'task1' && <Task1Chart questionIndex={questionIndex} />}
        <p className="text-xs text-text-secondary italic mt-3">{question.instruction}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={essay}
          onChange={(e) => setEssay(e.target.value)}
          onPaste={(e) => { e.preventDefault(); setError('붙여넣기가 비활성화되어 있습니다. 직접 입력해주세요.') }}
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
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {loading ? '분석 중...' : '피드백 받기'}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-error/10 text-error text-sm">{error}</div>
      )}

      <FeedbackDisplay feedback={feedback} taskType={taskType} essay={essay} />
    </div>
  )
}
