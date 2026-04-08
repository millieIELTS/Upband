import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { History as HistoryIcon, PenLine, Mic, LogIn, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { getWritingHistory, getSpeakingHistory } from '../lib/submissions'

export default function History() {
  const { user, loading: authLoading } = useAuth()
  const [tab, setTab] = useState('writing')
  const [writingData, setWritingData] = useState([])
  const [speakingData, setSpeakingData] = useState([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    Promise.all([
      getWritingHistory(user.id),
      getSpeakingHistory(user.id),
    ]).then(([w, s]) => {
      setWritingData(w.data || [])
      setSpeakingData(s.data || [])
      setLoading(false)
    })
  }, [user])

  if (authLoading) return null

  if (!user) {
    return (
      <div className="text-center py-16">
        <HistoryIcon size={48} className="text-text-secondary mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">제출 히스토리</h1>
        <p className="text-text-secondary mb-6">로그인 후 이전 피드백 기록을 확인할 수 있습니다.</p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium text-sm no-underline hover:bg-primary-dark transition-colors"
        >
          <LogIn size={16} /> 로그인
        </Link>
      </div>
    )
  }

  const data = tab === 'writing' ? writingData : speakingData

  const bandColor = (score) => {
    if (!score) return 'text-text-secondary'
    if (score >= 7) return 'text-band-high'
    if (score >= 6) return 'text-band-mid'
    return 'text-band-low'
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">제출 히스토리</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setTab('writing'); setExpanded(null) }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'writing' ? 'bg-primary text-white' : 'bg-surface border border-border text-text-secondary'
          }`}
        >
          <PenLine size={14} /> Writing
        </button>
        <button
          onClick={() => { setTab('speaking'); setExpanded(null) }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'speaking' ? 'bg-primary text-white' : 'bg-surface border border-border text-text-secondary'
          }`}
        >
          <Mic size={14} /> Speaking
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-text-secondary">불러오는 중...</div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-xl border border-border">
          <p className="text-text-secondary mb-4">아직 제출 기록이 없습니다.</p>
          <Link
            to={tab === 'writing' ? '/writing' : '/speaking'}
            className="text-primary text-sm font-medium no-underline hover:underline"
          >
            {tab === 'writing' ? 'Writing' : 'Speaking'} 시작하기 →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {data.map((item) => {
            const isExpanded = expanded === item.id
            const displayBand = item.teacher_band || item.overall_band
            const hasTeacherFeedback = item.teacher_band || item.teacher_feedback

            return (
              <div key={item.id} className="bg-surface rounded-xl border border-border overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : item.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`text-xl font-bold min-w-[3rem] text-center ${bandColor(displayBand)}`}>
                      {displayBand || '-'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">
                          {tab === 'writing'
                            ? `${item.task_type === 'task1' ? 'Task 1' : 'Task 2'}`
                            : `${item.part?.replace('part', 'Part ')}`
                          }
                        </span>
                        {item.is_homework && (
                          <span className="px-1.5 py-0.5 rounded bg-accent/10 text-accent text-[10px] font-medium">숙제</span>
                        )}
                        {hasTeacherFeedback && (
                          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium">
                            <MessageSquare size={9} /> 선생님 피드백
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-text-secondary mt-0.5">
                        {formatDate(item.created_at)}
                        {tab === 'writing' && item.word_count ? ` · ${item.word_count}w` : ''}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {tab === 'writing' && item.overall_band && (
                      <div className="hidden sm:flex gap-2 text-xs text-text-secondary">
                        <span>CC {item.score_cc}</span>
                        <span>LR {item.score_lr}</span>
                        <span>GRA {item.score_gra}</span>
                      </div>
                    )}
                    {isExpanded ? <ChevronUp size={16} className="text-text-secondary" /> : <ChevronDown size={16} className="text-text-secondary" />}
                  </div>
                </div>

                {isExpanded && tab === 'writing' && (
                  <div className="border-t border-border p-4 bg-bg/50 space-y-3">
                    {/* 선생님 피드백 */}
                    {hasTeacherFeedback && (
                      <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare size={14} className="text-primary" />
                          <span className="text-sm font-semibold text-primary">선생님 피드백</span>
                          {item.teacher_band && (
                            <span className={`text-sm font-bold ${bandColor(item.teacher_band)}`}>
                              Band {item.teacher_band}
                            </span>
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

                    {/* 에세이 */}
                    {item.essay && (
                      <div>
                        <p className="text-xs font-medium text-text-secondary mb-1">내 에세이</p>
                        <div className="text-sm bg-white p-3 rounded-lg border border-border whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                          {item.essay}
                        </div>
                      </div>
                    )}

                    {/* AI 채점 (있는 경우) */}
                    {item.overall_band && (
                      <div className="flex gap-3 flex-wrap text-xs text-text-secondary">
                        <span>AI Band: <b>{item.overall_band}</b></span>
                        {item.score_cc && <span>CC: <b>{item.score_cc}</b></span>}
                        {item.score_lr && <span>LR: <b>{item.score_lr}</b></span>}
                        {item.score_gra && <span>GRA: <b>{item.score_gra}</b></span>}
                      </div>
                    )}
                  </div>
                )}

                {isExpanded && tab === 'speaking' && (
                  <div className="border-t border-border p-4 bg-bg/50 space-y-3">
                    {item.question && (
                      <div>
                        <p className="text-xs font-medium text-text-secondary mb-1">질문</p>
                        <p className="text-sm bg-white p-3 rounded-lg border border-border">{item.question}</p>
                      </div>
                    )}
                    {item.overall_band && (
                      <div className="flex gap-3 flex-wrap text-xs text-text-secondary">
                        <span>Band: <b>{item.overall_band}</b></span>
                        {item.score_fluency && <span>F: <b>{item.score_fluency}</b></span>}
                        {item.score_lexical && <span>L: <b>{item.score_lexical}</b></span>}
                        {item.score_grammar && <span>G: <b>{item.score_grammar}</b></span>}
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
