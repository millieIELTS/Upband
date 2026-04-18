import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, PenLine, Mic, CheckCircle, Circle, ChevronDown, ChevronUp,
  Clock, User as UserIcon, FileText, Save, Loader2,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export default function SubmissionDetail() {
  const { user, profile, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('writing')
  const [writing, setWriting] = useState([])
  const [speaking, setSpeaking] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [feedbackInput, setFeedbackInput] = useState({})
  const [bandInput, setBandInput] = useState({})
  const [saving, setSaving] = useState(null)

  const isAdmin = profile?.role === 'admin' || profile?.role === 'teacher'

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) return
    loadData()
  }, [user, authLoading, isAdmin])

  useEffect(() => {
    if (!authLoading && !user) navigate('/login')
  }, [authLoading, user, navigate])

  async function loadData() {
    setLoading(true)
    const [{ data: profiles }, { data: w }, { data: s }] = await Promise.all([
      supabase.rpc('get_all_profiles'),
      supabase.rpc('get_all_writing_submissions'),
      supabase.rpc('get_all_speaking_submissions'),
    ])
    setStudents(profiles || [])
    // 모의고사는 별도 페이지(/dashboard/mock-tests)에서 관리 — 일반 라이팅 목록에서는 제외
    const regularWriting = (w || []).filter(sub => !sub.feedback_json?.mock_test_id)
    setWriting(regularWriting.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
    setSpeaking((s || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
    setLoading(false)
  }

  async function toggleReviewed(type, id, current) {
    await supabase.rpc('admin_mark_reviewed', {
      table_name: type,
      submission_id: id,
      is_reviewed: !current,
    })
    if (type === 'writing') {
      setWriting(prev => prev.map(s => s.id === id ? { ...s, reviewed: !current } : s))
    } else {
      setSpeaking(prev => prev.map(s => s.id === id ? { ...s, reviewed: !current } : s))
    }
  }

  async function saveFeedback(subId) {
    const band = parseFloat(bandInput[subId])
    const fb = feedbackInput[subId]?.trim()
    if (!fb && isNaN(band)) return

    setSaving(subId)
    await supabase.rpc('admin_save_feedback', {
      submission_id: subId,
      band: isNaN(band) ? null : band,
      feedback: fb || null,
    })
    setWriting(prev => prev.map(s => s.id === subId ? {
      ...s,
      teacher_band: isNaN(band) ? s.teacher_band : band,
      teacher_feedback: fb || s.teacher_feedback,
      reviewed: true,
    } : s))
    setSaving(null)
  }

  const getStudent = (userId) => students.find(s => s.id === userId)

  const formatDate = (d) => new Date(d).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  const bandColor = (score) => {
    if (!score) return 'text-text-secondary'
    if (score >= 7) return 'text-band-high'
    if (score >= 6) return 'text-band-mid'
    return 'text-band-low'
  }

  if (authLoading || loading) {
    return <div className="text-center py-16 text-text-secondary">불러오는 중...</div>
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-16">
        <FileText size={48} className="text-text-secondary mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">제출 내역 관리</h1>
        <p className="text-text-secondary">관리자 권한이 필요합니다.</p>
      </div>
    )
  }

  const unreviewedWriting = writing.filter(s => !s.reviewed).length
  const unreviewedSpeaking = speaking.filter(s => !s.reviewed).length

  return (
    <div>
      <button
        onClick={() => navigate('/dashboard')}
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-4"
      >
        <ArrowLeft size={14} /> 대시보드로 돌아가기
      </button>

      <h1 className="text-2xl font-bold mb-6">제출 내역 관리</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('writing')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'writing' ? 'bg-primary text-white' : 'bg-surface border border-border text-text-secondary'
          }`}
        >
          <PenLine size={14} /> Writing
          {unreviewedWriting > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-error text-white font-bold">
              {unreviewedWriting}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('speaking')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'speaking' ? 'bg-primary text-white' : 'bg-surface border border-border text-text-secondary'
          }`}
        >
          <Mic size={14} /> Speaking
          {unreviewedSpeaking > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-error text-white font-bold">
              {unreviewedSpeaking}
            </span>
          )}
        </button>
      </div>

      {/* Writing Submissions */}
      {tab === 'writing' && (
        <div className="space-y-2">
          {writing.length === 0 && (
            <p className="text-center text-text-secondary py-8">Writing 제출 내역이 없습니다.</p>
          )}
          {writing.map((sub) => {
            const student = getStudent(sub.user_id)
            const isExpanded = expanded === sub.id
            return (
              <div key={sub.id} className="bg-surface rounded-xl border border-border overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : sub.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleReviewed('writing', sub.id, sub.reviewed) }}
                      className="shrink-0 hover:scale-110 transition-transform"
                    >
                      {sub.reviewed
                        ? <CheckCircle size={20} className="text-success" />
                        : <Circle size={20} className="text-text-secondary" />
                      }
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{student?.display_name || '알 수 없음'}</span>
                        <span className="text-xs text-text-secondary">
                          {sub.task_type === 'task1' ? 'Task 1' : 'Task 2'}
                          {sub.is_homework && <span className="ml-1 px-1.5 py-0.5 rounded bg-accent/10 text-accent text-[10px] font-medium">숙제</span>}
                        </span>
                        {sub.overall_band && (
                          <span className={`text-sm font-bold ${bandColor(sub.overall_band)}`}>
                            Band {sub.overall_band}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-text-secondary mt-0.5">
                        <Clock size={11} />
                        {formatDate(sub.created_at)}
                        {sub.word_count && <span>· {sub.word_count}w</span>}
                      </div>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={16} className="text-text-secondary shrink-0" /> : <ChevronDown size={16} className="text-text-secondary shrink-0" />}
                </div>

                {isExpanded && (
                  <div className="border-t border-border p-4 bg-bg/50 space-y-3">
                    {sub.question && (
                      <div>
                        <p className="text-xs font-medium text-text-secondary mb-1">문제</p>
                        <p className="text-sm bg-white p-3 rounded-lg border border-border">{sub.question}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-medium text-text-secondary mb-1">에세이</p>
                      <div className="text-sm bg-white p-3 rounded-lg border border-border whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                        {sub.essay}
                      </div>
                    </div>
                    {/* 기존 선생님 피드백 표시 */}
                    {sub.teacher_band && (
                      <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-primary">선생님 채점</span>
                          <span className={`text-sm font-bold ${bandColor(sub.teacher_band)}`}>Band {sub.teacher_band}</span>
                        </div>
                        {sub.teacher_feedback && (
                          <p className="text-sm text-text whitespace-pre-wrap">{sub.teacher_feedback}</p>
                        )}
                      </div>
                    )}

                    {/* 선생님 피드백 입력 폼 */}
                    <div className="p-3 bg-white rounded-lg border border-border space-y-2">
                      <p className="text-xs font-medium text-text-secondary">
                        {sub.teacher_band ? '피드백 수정' : '피드백 작성'}
                      </p>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-text-secondary shrink-0">Band</label>
                        <input
                          type="number"
                          min="0"
                          max="9"
                          step="0.5"
                          value={bandInput[sub.id] ?? sub.teacher_band ?? ''}
                          onChange={(e) => setBandInput(prev => ({ ...prev, [sub.id]: e.target.value }))}
                          placeholder="6.5"
                          className="w-20 px-2 py-1.5 text-sm rounded border border-border focus:outline-none focus:border-primary"
                        />
                      </div>
                      <textarea
                        value={feedbackInput[sub.id] ?? sub.teacher_feedback ?? ''}
                        onChange={(e) => setFeedbackInput(prev => ({ ...prev, [sub.id]: e.target.value }))}
                        placeholder="학생에게 전달할 피드백을 작성하세요..."
                        className="w-full h-28 p-2 text-sm rounded border border-border resize-y focus:outline-none focus:border-primary"
                      />
                      <button
                        onClick={() => saveFeedback(sub.id)}
                        disabled={saving === sub.id}
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
                      >
                        {saving === sub.id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        {saving === sub.id ? '저장 중...' : '피드백 저장'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Speaking Submissions */}
      {tab === 'speaking' && (
        <div className="space-y-2">
          {speaking.length === 0 && (
            <p className="text-center text-text-secondary py-8">Speaking 제출 내역이 없습니다.</p>
          )}
          {speaking.map((sub) => {
            const student = getStudent(sub.user_id)
            const isExpanded = expanded === sub.id
            return (
              <div key={sub.id} className="bg-surface rounded-xl border border-border overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : sub.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleReviewed('speaking', sub.id, sub.reviewed) }}
                      className="shrink-0 hover:scale-110 transition-transform"
                    >
                      {sub.reviewed
                        ? <CheckCircle size={20} className="text-success" />
                        : <Circle size={20} className="text-text-secondary" />
                      }
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{student?.display_name || '알 수 없음'}</span>
                        <span className="text-xs text-text-secondary">{sub.part?.replace('part', 'Part ')}</span>
                        {sub.overall_band && (
                          <span className={`text-sm font-bold ${bandColor(sub.overall_band)}`}>
                            Band {sub.overall_band}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-text-secondary mt-0.5">
                        <Clock size={11} />
                        {formatDate(sub.created_at)}
                      </div>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={16} className="text-text-secondary shrink-0" /> : <ChevronDown size={16} className="text-text-secondary shrink-0" />}
                </div>

                {isExpanded && (
                  <div className="border-t border-border p-4 bg-bg/50 space-y-3">
                    {sub.question && (
                      <div>
                        <p className="text-xs font-medium text-text-secondary mb-1">질문</p>
                        <p className="text-sm bg-white p-3 rounded-lg border border-border">{sub.question}</p>
                      </div>
                    )}
                    {sub.transcript && (
                      <div>
                        <p className="text-xs font-medium text-text-secondary mb-1">답변 (음성 → 텍스트)</p>
                        <div className="text-sm bg-white p-3 rounded-lg border border-border whitespace-pre-wrap leading-relaxed">
                          {sub.transcript}
                        </div>
                      </div>
                    )}
                    {sub.model_answer && (
                      <div>
                        <p className="text-xs font-medium text-text-secondary mb-1">모범 답안 (Band 7+)</p>
                        <div className="text-sm bg-white p-3 rounded-lg border border-border whitespace-pre-wrap leading-relaxed text-primary/80">
                          {sub.model_answer}
                        </div>
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
