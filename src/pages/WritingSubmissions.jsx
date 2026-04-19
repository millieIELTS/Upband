import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, PenLine, MessageSquare, ChevronDown, ChevronUp, Image } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { getWritingHistory } from '../lib/submissions'

function formatDate(d) {
  return new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

function formatTime(d) {
  return new Date(d).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

const bandColor = (score) => {
  if (!score) return 'text-text-secondary'
  if (score >= 7) return 'text-band-high'
  if (score >= 6) return 'text-band-mid'
  return 'text-band-low'
}

export default function WritingSubmissions() {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [filter, setFilter] = useState('all') // all, homework, mock

  useEffect(() => {
    if (!user) return
    getWritingHistory(user.id).then(({ data }) => {
      setData(data || [])
      setLoading(false)
    })
  }, [user])

  const filtered = data.filter(item => {
    if (filter === 'homework') return item.is_homework
    if (filter === 'mock') return !item.is_homework
    return true
  })

  return (
    <div>
      <Link
        to="/history"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-4 no-underline"
      >
        <ArrowLeft size={14} /> 학습 기록으로 돌아가기
      </Link>

      <h1 className="text-2xl font-bold mb-2">Writing 제출 내역</h1>
      <p className="text-text-secondary text-sm mb-6">제출한 Writing 과제를 확인하세요.</p>

      {/* 필터 */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'all', label: '전체' },
          { key: 'homework', label: 'Writing' },
          { key: 'mock', label: '라이팅 모의고사' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.key
                ? 'bg-primary text-white'
                : 'bg-surface border border-border text-text-secondary hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-text-secondary">불러오는 중...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-10 text-center">
          <PenLine size={40} className="text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary">제출한 Writing이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => {
            const isExpanded = expandedId === item.id
            const displayBand = item.teacher_band ?? item.overall_band
            const hasTeacherFeedback = item.teacher_band || item.teacher_feedback

            return (
              <div key={item.id} className="bg-surface rounded-xl border border-border overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <PenLine size={18} className="text-blue-500" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold">
                          {item.task_type === 'task1' ? 'Task 1' : 'Task 2'}
                        </span>
                        {item.is_homework ? (
                          <span className="px-1.5 py-0.5 rounded bg-accent/10 text-accent text-[10px] font-medium">Writing</span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-medium">라이팅 모의고사</span>
                        )}
                        {hasTeacherFeedback && (
                          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-green-50 text-green-600 text-[10px] font-medium">
                            <MessageSquare size={9} /> 피드백 완료
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {formatDate(item.created_at)} {formatTime(item.created_at)} · {item.word_count}w
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {displayBand != null ? (
                      <span className={`text-xl font-bold ${bandColor(displayBand)}`}>{displayBand}</span>
                    ) : (
                      <span className="text-xs text-text-secondary bg-gray-100 px-2 py-1 rounded">미채점</span>
                    )}
                    {isExpanded ? <ChevronUp size={16} className="text-text-secondary" /> : <ChevronDown size={16} className="text-text-secondary" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border p-4 bg-bg/50 space-y-3">
                    {/* 선생님 피드백 */}
                    {hasTeacherFeedback && (
                      <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="flex items-center gap-2 mb-1.5">
                          <MessageSquare size={13} className="text-primary" />
                          <span className="text-xs font-semibold text-primary">선생님 피드백</span>
                          {item.teacher_band != null && (
                            <span className={`text-sm font-bold ${bandColor(item.teacher_band)}`}>Band {item.teacher_band}</span>
                          )}
                        </div>
                        {item.teacher_feedback && (
                          <p className="text-sm text-text whitespace-pre-wrap leading-relaxed">{item.teacher_feedback}</p>
                        )}
                      </div>
                    )}

                    {/* 문제 */}
                    {item.question && (
                      <div>
                        <p className="text-xs font-medium text-text-secondary mb-1">문제</p>
                        <p className="text-sm bg-white p-3 rounded-lg border border-border">{item.question}</p>
                      </div>
                    )}

                    {/* 문제 이미지 */}
                    {item.question_image_url && (
                      <div>
                        <p className="text-xs font-medium text-text-secondary mb-1 flex items-center gap-1">
                          <Image size={12} /> 문제 이미지
                        </p>
                        <img
                          src={item.question_image_url}
                          alt="문제 이미지"
                          className="max-h-64 rounded-lg border border-border"
                        />
                      </div>
                    )}

                    {/* 에세이 */}
                    {item.essay && (
                      <div>
                        <p className="text-xs font-medium text-text-secondary mb-1">내 에세이</p>
                        <div className="text-sm bg-white p-3 rounded-lg border border-border whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                          {item.essay}
                        </div>
                      </div>
                    )}

                    {/* AI 점수 상세 */}
                    {item.overall_band && (
                      <div className="flex gap-3 flex-wrap text-xs text-text-secondary">
                        <span>AI Band: <b>{item.overall_band}</b></span>
                        {item.score_ta && <span>TA: <b>{item.score_ta}</b></span>}
                        {item.score_tr && <span>TR: <b>{item.score_tr}</b></span>}
                        {item.score_cc && <span>CC: <b>{item.score_cc}</b></span>}
                        {item.score_lr && <span>LR: <b>{item.score_lr}</b></span>}
                        {item.score_gra && <span>GRA: <b>{item.score_gra}</b></span>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
