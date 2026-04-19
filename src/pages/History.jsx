import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { History as HistoryIcon, PenLine, Mic, LogIn, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, MessageSquare, Flame, Calendar } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { getWritingHistory, getSpeakingHistory } from '../lib/submissions'

// 날짜를 'YYYY-MM-DD' 형식으로
function toDateKey(d) {
  const dt = new Date(d)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}

function formatDateKr(d) {
  return new Date(d).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
}

function formatTimeKr(d) {
  return new Date(d).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

export default function History() {
  const { user, loading: authLoading } = useAuth()
  const [writingData, setWritingData] = useState([])
  const [speakingData, setSpeakingData] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(toDateKey(new Date()))
  const [calMonth, setCalMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [expandedId, setExpandedId] = useState(null)

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

  // 모든 활동을 합치고 날짜별로 그룹핑
  const allActivities = useMemo(() => {
    const writing = writingData.map(w => ({ ...w, _type: 'writing' }))
    const speaking = speakingData.map(s => ({ ...s, _type: 'speaking' }))
    return [...writing, ...speaking].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [writingData, speakingData])

  const activitiesByDate = useMemo(() => {
    const map = {}
    allActivities.forEach(a => {
      const key = toDateKey(a.created_at)
      if (!map[key]) map[key] = []
      map[key].push(a)
    })
    return map
  }, [allActivities])

  const isWritingMock = (item) => item._type === 'writing' && !item.is_homework
  const isSpeakingMock = (item) => item._type === 'speaking' && item.feedback_json?.speaking_mock_id
  const isMockTest = (item) => isWritingMock(item) || isSpeakingMock(item)

  // 연속 학습일 계산
  const streak = useMemo(() => {
    if (allActivities.length === 0) return 0
    let count = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < 365; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = toDateKey(d)
      if (activitiesByDate[key]) {
        count++
      } else {
        // 오늘 아직 안 했으면 어제부터 세기
        if (i === 0) continue
        break
      }
    }
    return count
  }, [activitiesByDate, allActivities])

  // 이번 달 통계
  const monthStats = useMemo(() => {
    const now = new Date()
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const monthActivities = allActivities.filter(a => toDateKey(a.created_at).startsWith(thisMonth))
    return {
      total: monthActivities.length,
      writing: monthActivities.filter(a => a._type === 'writing').length,
      speaking: monthActivities.filter(a => a._type === 'speaking').length,
    }
  }, [allActivities])

  // 캘린더 데이터 생성
  const calendarData = useMemo(() => {
    const { year, month } = calMonth
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDow = firstDay.getDay() // 0=일요일
    const daysInMonth = lastDay.getDate()

    const cells = []
    // 빈 칸 (이전 달)
    for (let i = 0; i < startDow; i++) cells.push(null)
    // 날짜 칸
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const dayItems = activitiesByDate[key] || []
      cells.push({
        day: d,
        key,
        count: dayItems.length,
        hasMock: dayItems.some(isMockTest),
      })
    }
    return cells
  }, [calMonth, activitiesByDate])

  const prevMonth = () => setCalMonth(prev => {
    const m = prev.month - 1
    return m < 0 ? { year: prev.year - 1, month: 11 } : { ...prev, month: m }
  })
  const nextMonth = () => setCalMonth(prev => {
    const m = prev.month + 1
    return m > 11 ? { year: prev.year + 1, month: 0 } : { ...prev, month: m }
  })

  const selectedActivities = activitiesByDate[selectedDate] || []

  const bandColor = (score) => {
    if (!score) return 'text-text-secondary'
    if (score >= 7) return 'text-band-high'
    if (score >= 6) return 'text-band-mid'
    return 'text-band-low'
  }

  if (authLoading) return null

  if (!user) {
    return (
      <div className="text-center py-16">
        <HistoryIcon size={48} className="text-text-secondary mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">학습 기록</h1>
        <p className="text-text-secondary mb-6">로그인 후 학습 기록을 확인할 수 있습니다.</p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium text-sm no-underline hover:bg-primary-dark transition-colors"
        >
          <LogIn size={16} /> 로그인
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">학습 기록</h1>
        <Link
          to="/history/writing"
          className="flex items-center gap-1.5 px-4 py-2 bg-surface border border-border rounded-lg text-sm font-medium text-text-secondary hover:border-primary hover:text-primary transition-colors no-underline"
        >
          <PenLine size={14} /> Writing 내역
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-8 text-text-secondary">불러오는 중...</div>
      ) : (
        <>
          {/* 상단 통계 카드 */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-surface rounded-xl border border-border p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-orange-500 mb-1">
                <Flame size={20} />
                <span className="text-2xl font-bold">{streak}</span>
              </div>
              <p className="text-xs text-text-secondary">연속 학습일</p>
            </div>
            <div className="bg-surface rounded-xl border border-border p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">{monthStats.total}</div>
              <p className="text-xs text-text-secondary">이번 달 학습</p>
            </div>
            <div className="bg-surface rounded-xl border border-border p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="flex items-center gap-0.5 text-sm font-bold text-primary">
                  <PenLine size={12} />{monthStats.writing}
                </span>
                <span className="flex items-center gap-0.5 text-sm font-bold text-primary">
                  <Mic size={12} />{monthStats.speaking}
                </span>
              </div>
              <p className="text-xs text-text-secondary">W / S</p>
            </div>
          </div>

          {/* 캘린더 */}
          <div className="bg-surface rounded-xl border border-border p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronLeft size={18} className="text-text-secondary" />
              </button>
              <h3 className="text-sm font-semibold flex items-center gap-1.5">
                <Calendar size={14} className="text-primary" />
                {calMonth.year}년 {calMonth.month + 1}월
              </h3>
              <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronRight size={18} className="text-text-secondary" />
              </button>
            </div>

            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['일', '월', '화', '수', '목', '금', '토'].map(d => (
                <div key={d} className="text-center text-[10px] text-text-secondary font-medium py-1">{d}</div>
              ))}
            </div>

            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 gap-1">
              {calendarData.map((cell, i) => {
                if (!cell) return <div key={`empty-${i}`} />
                const isSelected = cell.key === selectedDate
                const isToday = cell.key === toDateKey(new Date())
                const intensity = cell.count === 0 ? 0 : cell.count <= 1 ? 1 : cell.count <= 3 ? 2 : 3

                return (
                  <button
                    key={cell.key}
                    onClick={() => setSelectedDate(cell.key)}
                    className={`aspect-square rounded-lg text-xs font-medium flex items-center justify-center transition-all relative
                      ${isSelected
                        ? 'ring-2 ring-primary ring-offset-1'
                        : ''
                      }
                      ${intensity === 0
                        ? 'bg-gray-50 text-text-secondary hover:bg-gray-100'
                        : intensity === 1
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : intensity === 2
                        ? 'bg-green-300 text-green-900 hover:bg-green-400'
                        : 'bg-green-500 text-white hover:bg-green-600'
                      }
                    `}
                  >
                    {cell.day}
                    {cell.hasMock && (
                      <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-500" title="모의고사" />
                    )}
                    {isToday && (
                      <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* 범례 */}
            <div className="flex items-center justify-between mt-3 text-[10px] text-text-secondary">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                모의고사
              </span>
              <div className="flex items-center gap-1.5">
                <span>적음</span>
                <div className="w-3 h-3 rounded bg-gray-50 border border-gray-200" />
                <div className="w-3 h-3 rounded bg-green-100" />
                <div className="w-3 h-3 rounded bg-green-300" />
                <div className="w-3 h-3 rounded bg-green-500" />
                <span>많음</span>
              </div>
            </div>
          </div>

          {/* 선택한 날짜의 활동 목록 */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Calendar size={14} className="text-primary" />
              {formatDateKr(selectedDate + 'T00:00:00')}
              {selectedActivities.length > 0 && (
                <span className="text-xs text-text-secondary font-normal">({selectedActivities.length}개 활동)</span>
              )}
            </h3>

            {selectedActivities.length === 0 ? (
              <div className="bg-surface rounded-xl border border-border p-6 text-center">
                <p className="text-sm text-text-secondary">이 날의 학습 기록이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedActivities.map(item => {
                  const isExpanded = expandedId === item.id
                  const displayBand = item.teacher_band ?? item.overall_band
                  const hasTeacherFeedback = item.teacher_band || item.teacher_feedback

                  return (
                    <div key={item.id} className="bg-surface rounded-xl border border-border overflow-hidden">
                      <div
                        className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            item._type === 'writing' ? 'bg-blue-50' : 'bg-purple-50'
                          }`}>
                            {item._type === 'writing'
                              ? <PenLine size={14} className="text-blue-500" />
                              : <Mic size={14} className="text-purple-500" />
                            }
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium">
                                {isSpeakingMock(item)
                                  ? `Speaking Mock Test ${item.feedback_json.speaking_mock_id}회`
                                  : item._type === 'writing'
                                    ? `Writing ${item.task_type === 'task1' ? 'Task 1' : 'Task 2'}`
                                    : `Speaking ${item.part?.replace('part', 'Part ')}`
                                }
                              </span>
                              {isWritingMock(item) && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-medium">라이팅 모의고사</span>
                              )}
                              {isSpeakingMock(item) && (
                                <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px] font-medium">스피킹 모의고사</span>
                              )}
                              {item.is_homework && (
                                <span className="px-1.5 py-0.5 rounded bg-accent/10 text-accent text-[10px] font-medium">숙제</span>
                              )}
                              {hasTeacherFeedback && (
                                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium">
                                  <MessageSquare size={9} /> 피드백
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-text-secondary mt-0.5">
                              {formatTimeKr(item.created_at)}
                              {item._type === 'writing' && item.word_count ? ` · ${item.word_count}w` : ''}
                              {isSpeakingMock(item) && item.feedback_json?.summary
                                ? ` · ${item.feedback_json.summary}`
                                : item._type === 'speaking' && item.question
                                  ? ` · ${item.question.slice(0, 30)}...`
                                  : ''}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {displayBand != null ? (
                            <span className={`text-lg font-bold ${bandColor(displayBand)}`}>{displayBand}</span>
                          ) : isSpeakingMock(item) ? (
                            <span className="text-xs text-emerald-600 font-medium">완료</span>
                          ) : (
                            <span className="text-xs text-text-secondary">미채점</span>
                          )}
                          {isExpanded ? <ChevronUp size={14} className="text-text-secondary" /> : <ChevronDown size={14} className="text-text-secondary" />}
                        </div>
                      </div>

                      {/* 확장 상세 */}
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

                          {/* 에세이 (Writing) */}
                          {item._type === 'writing' && item.essay && (
                            <div>
                              <p className="text-xs font-medium text-text-secondary mb-1">내 에세이</p>
                              <div className="text-sm bg-white p-3 rounded-lg border border-border whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                                {item.essay}
                              </div>
                            </div>
                          )}

                          {/* 점수 상세 */}
                          {item._type === 'writing' && item.overall_band && (
                            <div className="flex gap-3 flex-wrap text-xs text-text-secondary">
                              <span>AI Band: <b>{item.overall_band}</b></span>
                              {item.score_cc && <span>CC: <b>{item.score_cc}</b></span>}
                              {item.score_lr && <span>LR: <b>{item.score_lr}</b></span>}
                              {item.score_gra && <span>GRA: <b>{item.score_gra}</b></span>}
                            </div>
                          )}
                          {item._type === 'speaking' && item.overall_band && (
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

        </>
      )}
    </div>
  )
}
