import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, FileText, PenLine, Mic, ChevronDown, ChevronUp,
  Clock, Save, Loader2, CheckCircle, Circle,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

const MOCK_TEST_NAMES = {
  '1': '모의고사 1회',
}

export default function DashboardMockTests() {
  const { user, profile, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('writing')
  const [writing, setWriting] = useState([])
  const [speaking, setSpeaking] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedAttempt, setExpandedAttempt] = useState(null)
  const [bandInput, setBandInput] = useState({})
  const [feedbackInput, setFeedbackInput] = useState({})
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
    // 모의고사 표식이 있는 것만 필터
    const writingMocks = (w || []).filter(x => x.feedback_json?.mock_test_id)
    const speakingMocks = (s || []).filter(x => x.feedback_json?.mock_test_id)
    setWriting(writingMocks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
    setSpeaking(speakingMocks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
    setLoading(false)
  }

  // 같은 학생이 같은 모의고사를 본 것을 attempt 단위로 묶기
  // attemptId = `${user_id}::${mock_test_id}::${YYYY-MM-DD HH:mm}` (1시간 이내 묶음)
  function groupAttempts(submissions) {
    const groups = {}
    for (const sub of submissions) {
      const mockId = sub.feedback_json?.mock_test_id
      const userId = sub.user_id
      // 같은 mock + 같은 user + 1시간 이내를 한 응시로
      const ts = new Date(sub.created_at).getTime()
      const existing = Object.values(groups).find(g =>
        g.userId === userId && g.mockId === mockId && Math.abs(g.startTs - ts) < 60 * 60 * 1000
      )
      if (existing) {
        existing.items.push(sub)
        existing.startTs = Math.min(existing.startTs, ts)
      } else {
        const key = `${userId}::${mockId}::${ts}`
        groups[key] = {
          key,
          userId,
          mockId,
          startTs: ts,
          items: [sub],
        }
      }
    }
    return Object.values(groups).sort((a, b) => b.startTs - a.startTs)
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

  async function saveFeedback(type, subId) {
    const band = parseFloat(bandInput[subId])
    const fb = feedbackInput[subId]?.trim()
    if (!fb && isNaN(band)) return

    setSaving(subId)
    try {
      if (type === 'writing') {
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
      } else {
        // Speaking은 admin_save_feedback이 writing 전용일 수 있어 직접 update 시도
        const updates = {}
        if (!isNaN(band)) updates.teacher_band = band
        if (fb) updates.teacher_feedback = fb
        updates.reviewed = true
        const { error } = await supabase
          .from('speaking_submissions')
          .update(updates)
          .eq('id', subId)
        if (error) throw error
        setSpeaking(prev => prev.map(s => s.id === subId ? { ...s, ...updates } : s))
      }
    } catch (err) {
      alert('저장 실패: ' + err.message)
    }
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
        <h1 className="text-2xl font-bold mb-2">모의고사 채점</h1>
        <p className="text-text-secondary">관리자 권한이 필요합니다.</p>
      </div>
    )
  }

  const writingAttempts = groupAttempts(writing)
  const speakingAttempts = groupAttempts(speaking)
  const unreviewedW = writing.filter(s => !s.reviewed).length
  const unreviewedS = speaking.filter(s => !s.reviewed).length

  return (
    <div>
      <button
        onClick={() => navigate('/dashboard')}
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-4"
      >
        <ArrowLeft size={14} /> 대시보드로 돌아가기
      </button>

      <h1 className="text-2xl font-bold mb-2">모의고사 채점</h1>
      <p className="text-sm text-text-secondary mb-6">
        모의고사 응시 내역만 모아서 채점할 수 있어요. 한 응시(같은 학생 · 같은 회차)는 묶어서 표시됩니다.
      </p>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('writing')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'writing' ? 'bg-primary text-white' : 'bg-surface border border-border text-text-secondary'
          }`}
        >
          <PenLine size={14} /> Writing
          {unreviewedW > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-error text-white font-bold">
              {unreviewedW}
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
          {unreviewedS > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-error text-white font-bold">
              {unreviewedS}
            </span>
          )}
        </button>
      </div>

      {/* Attempts list */}
      <div className="space-y-2">
        {(tab === 'writing' ? writingAttempts : speakingAttempts).length === 0 && (
          <p className="text-center text-text-secondary py-12 bg-surface rounded-xl border border-border">
            아직 모의고사 응시 내역이 없어요.
          </p>
        )}

        {(tab === 'writing' ? writingAttempts : speakingAttempts).map((attempt) => {
          const student = getStudent(attempt.userId)
          const isExpanded = expandedAttempt === attempt.key
          const allReviewed = attempt.items.every(i => i.reviewed)
          const mockName = MOCK_TEST_NAMES[attempt.mockId] || `모의고사 ${attempt.mockId}회`

          return (
            <div key={attempt.key} className="bg-surface rounded-xl border border-border overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedAttempt(isExpanded ? null : attempt.key)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {tab === 'writing' ? (
                    <PenLine size={16} className="text-primary shrink-0" />
                  ) : (
                    <Mic size={16} className="text-accent shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold">
                        {student?.display_name || '알 수 없음'}
                      </span>
                      <span className="text-xs text-text-secondary">·</span>
                      <span className="text-sm">{mockName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        allReviewed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {allReviewed ? '채점완료' : `미채점 ${attempt.items.filter(i => !i.reviewed).length}/${attempt.items.length}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-secondary mt-0.5">
                      <Clock size={11} />
                      {formatDate(new Date(attempt.startTs).toISOString())}
                    </div>
                  </div>
                </div>
                {isExpanded ? <ChevronUp size={16} className="text-text-secondary" /> : <ChevronDown size={16} className="text-text-secondary" />}
              </div>

              {isExpanded && (
                <div className="border-t border-border p-4 bg-bg/50 space-y-3">
                  {attempt.items
                    .sort((a, b) => {
                      // task1 → task2, part1 → part2 → part3
                      const aKey = a.task_type || a.part || ''
                      const bKey = b.task_type || b.part || ''
                      return aKey.localeCompare(bKey)
                    })
                    .map((sub) => (
                      <SubmissionCard
                        key={sub.id}
                        sub={sub}
                        type={tab}
                        bandInput={bandInput}
                        setBandInput={setBandInput}
                        feedbackInput={feedbackInput}
                        setFeedbackInput={setFeedbackInput}
                        onSave={() => saveFeedback(tab, sub.id)}
                        onToggleReviewed={() => toggleReviewed(tab, sub.id, sub.reviewed)}
                        saving={saving === sub.id}
                        bandColor={bandColor}
                      />
                    ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SubmissionCard({ sub, type, bandInput, setBandInput, feedbackInput, setFeedbackInput, onSave, onToggleReviewed, saving, bandColor }) {
  const partLabel = type === 'writing'
    ? (sub.task_type === 'task1' ? 'Task 1' : 'Task 2')
    : `${sub.part?.replace('part', 'Part ')}${sub.feedback_json?.q_index !== undefined ? ` · Q${sub.feedback_json.q_index + 1}` : ''}`

  return (
    <div className="bg-white rounded-lg border border-border p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleReviewed}
            className="hover:scale-110 transition-transform"
          >
            {sub.reviewed
              ? <CheckCircle size={18} className="text-success" />
              : <Circle size={18} className="text-text-secondary" />
            }
          </button>
          <span className="text-sm font-semibold">{partLabel}</span>
          {type === 'writing' && sub.word_count && (
            <span className="text-xs text-text-secondary">· {sub.word_count}w</span>
          )}
          {sub.teacher_band != null && (
            <span className={`text-sm font-bold ml-2 ${bandColor(sub.teacher_band)}`}>
              Band {sub.teacher_band}
            </span>
          )}
        </div>
      </div>

      {sub.question && (
        <div>
          <p className="text-xs font-medium text-text-secondary mb-1">문제</p>
          <p className="text-sm bg-bg p-2 rounded border border-border whitespace-pre-line">{sub.question}</p>
        </div>
      )}

      {type === 'writing' && sub.essay && (
        <div>
          <p className="text-xs font-medium text-text-secondary mb-1">에세이</p>
          <div className="text-sm bg-bg p-3 rounded border border-border whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
            {sub.essay}
          </div>
        </div>
      )}

      {type === 'speaking' && sub.transcript && (
        <div>
          <p className="text-xs font-medium text-text-secondary mb-1">답변 (음성 → 텍스트)</p>
          <div className="text-sm bg-bg p-3 rounded border border-border whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
            {sub.transcript}
          </div>
        </div>
      )}

      {/* 채점 입력 */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
        <p className="text-xs font-medium text-primary">
          {sub.teacher_band ? '채점 수정' : '채점하기'}
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
          placeholder="피드백을 작성하세요..."
          className="w-full h-24 p-2 text-sm rounded border border-border resize-y focus:outline-none focus:border-primary"
        />
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  )
}
