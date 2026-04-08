import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, PenLine, Mic, CheckCircle, Circle, ChevronDown, ChevronUp,
  Clock, User as UserIcon, FileText,
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
    setWriting((w || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
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
                    {sub.overall_band && (
                      <div className="flex gap-3 flex-wrap text-xs">
                        <span>CC: <b>{sub.score_cc}</b></span>
                        <span>LR: <b>{sub.score_lr}</b></span>
                        <span>GRA: <b>{sub.score_gra}</b></span>
                        {sub.score_ta && <span>TA: <b>{sub.score_ta}</b></span>}
                        {sub.score_tr && <span>TR: <b>{sub.score_tr}</b></span>}
                      </div>
                    )}
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
