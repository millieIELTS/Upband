import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, PenLine, Mic, Coins, Search,
  ChevronDown, ChevronUp, Plus, Minus, Shield, Eye,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { user, profile, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('students')
  const [students, setStudents] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [stats, setStats] = useState({ totalStudents: 0, totalWriting: 0, totalSpeaking: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedUser, setExpandedUser] = useState(null)
  const [expandedSubmissions, setExpandedSubmissions] = useState([])
  const [creditInput, setCreditInput] = useState({})

  const isAdmin = profile?.role === 'teacher' || profile?.role === 'admin'

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) return
    loadData()
  }, [user, authLoading, isAdmin])

  useEffect(() => {
    if (!authLoading && !user) navigate('/login')
  }, [authLoading, user, navigate])

  async function loadData() {
    setLoading(true)

    // RPC 함수로 조회 (RLS 우회)
    const { data: allProfiles } = await supabase.rpc('get_all_profiles')
    const { data: allWriting } = await supabase.rpc('get_all_writing_submissions')
    const { data: allSpeaking } = await supabase.rpc('get_all_speaking_submissions')

    setStudents(allProfiles || [])
    setSubmissions([
      ...(allWriting || []).map(s => ({ ...s, _type: 'writing' })),
      ...(allSpeaking || []).map(s => ({ ...s, _type: 'speaking' })),
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))

    setStats({
      totalStudents: (allProfiles || []).filter(p => p.role === 'student').length,
      totalWriting: (allWriting || []).length,
      totalSpeaking: (allSpeaking || []).length,
      unreviewedWriting: (allWriting || []).filter(s => !s.reviewed).length,
      unreviewedSpeaking: (allSpeaking || []).filter(s => !s.reviewed).length,
    })

    setLoading(false)
  }

  async function updateCredits(userId, amount) {
    const student = students.find(s => s.id === userId)
    if (!student) return
    const newCredits = Math.max(0, student.credits + amount)
    await supabase.rpc('admin_update_credits', { target_user_id: userId, new_credits: newCredits })
    setStudents(prev => prev.map(s => s.id === userId ? { ...s, credits: newCredits } : s))
  }

  async function setCredits(userId) {
    const val = parseInt(creditInput[userId])
    if (isNaN(val) || val < 0) return
    await supabase.rpc('admin_update_credits', { target_user_id: userId, new_credits: val })
    setStudents(prev => prev.map(s => s.id === userId ? { ...s, credits: val } : s))
    setCreditInput(prev => ({ ...prev, [userId]: '' }))
  }

  async function toggleRole(userId, currentRole) {
    const newRole = currentRole === 'student' ? 'teacher' : 'student'
    await supabase.rpc('admin_update_role', { target_user_id: userId, new_role: newRole })
    setStudents(prev => prev.map(s => s.id === userId ? { ...s, role: newRole } : s))
  }

  function toggleExpand(userId) {
    if (expandedUser === userId) {
      setExpandedUser(null)
      setExpandedSubmissions([])
    } else {
      setExpandedUser(userId)
      setExpandedSubmissions(submissions.filter(s => s.user_id === userId))
    }
  }

  if (authLoading || loading) {
    return <div className="text-center py-16 text-text-secondary">불러오는 중...</div>
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-16">
        <LayoutDashboard size={48} className="text-text-secondary mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">관리자 대시보드</h1>
        <p className="text-text-secondary">관리자 권한이 필요합니다.</p>
      </div>
    )
  }

  const filteredStudents = students.filter(s =>
    s.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  )

  const bandColor = (score) => {
    if (score >= 7) return 'text-band-high'
    if (score >= 6) return 'text-band-mid'
    return 'text-band-low'
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('ko-KR', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">관리자 대시보드</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-surface rounded-xl border border-border p-4 text-center">
          <Users size={20} className="text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold">{stats.totalStudents}</p>
          <p className="text-xs text-text-secondary">학생 수</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4 text-center">
          <PenLine size={20} className="text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold">
            {stats.unreviewedWriting > 0 ? (
              <span className="text-error">{stats.unreviewedWriting}</span>
            ) : (
              <span className="text-success">0</span>
            )}
            <span className="text-text-secondary text-sm font-normal"> / {stats.totalWriting}</span>
          </p>
          <p className="text-xs text-text-secondary">Writing 미확인</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4 text-center">
          <Mic size={20} className="text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold">
            {stats.unreviewedSpeaking > 0 ? (
              <span className="text-error">{stats.unreviewedSpeaking}</span>
            ) : (
              <span className="text-success">0</span>
            )}
            <span className="text-text-secondary text-sm font-normal"> / {stats.totalSpeaking}</span>
          </p>
          <p className="text-xs text-text-secondary">Speaking 미확인</p>
        </div>
      </div>

      {/* 제출 내역 관리 바로가기 */}
      <Link
        to="/dashboard/submissions"
        className="block mb-6 p-4 bg-accent/5 border border-accent/20 rounded-xl no-underline hover:bg-accent/10 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye size={18} className="text-accent" />
            <span className="text-sm font-medium text-text">제출 내역 관리</span>
            <span className="text-xs text-text-secondary">학생 에세이 확인 · 확인여부 체크</span>
          </div>
          <span className="text-xs text-accent font-medium">바로가기 →</span>
        </div>
      </Link>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('students')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'students' ? 'bg-primary text-white' : 'bg-surface border border-border text-text-secondary'
          }`}
        >
          <Users size={14} /> 학생 관리
        </button>
        <button
          onClick={() => setTab('submissions')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'submissions' ? 'bg-primary text-white' : 'bg-surface border border-border text-text-secondary'
          }`}
        >
          <PenLine size={14} /> 전체 제출 내역
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="이름 또는 이메일로 검색..."
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Students Tab */}
      {tab === 'students' && (
        <div className="space-y-2">
          {filteredStudents.map((s) => {
            const userSubmissions = submissions.filter(sub => sub.user_id === s.id)
            const isExpanded = expandedUser === s.id
            return (
              <div key={s.id} className="bg-surface rounded-xl border border-border overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpand(s.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary">
                        {(s.display_name || '?')[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{s.display_name || '이름 없음'}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          s.role === 'admin' ? 'bg-error/10 text-error' :
                          s.role === 'teacher' ? 'bg-primary/10 text-primary' :
                          'bg-gray-100 text-text-secondary'
                        }`}>
                          {s.role === 'admin' ? '관리자' : s.role === 'teacher' ? '선생님' : '학생'}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary truncate">{s.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="flex items-center gap-1 text-xs text-text-secondary">
                      <PenLine size={12} /> {userSubmissions.filter(sub => sub._type === 'writing').length}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-text-secondary">
                      <Mic size={12} /> {userSubmissions.filter(sub => sub._type === 'speaking').length}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-accent font-medium">
                      <Coins size={12} /> {s.credits}
                    </span>
                    {isExpanded ? <ChevronUp size={16} className="text-text-secondary" /> : <ChevronDown size={16} className="text-text-secondary" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border p-4 bg-bg/50">
                    {/* 크레딧 관리 */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="text-xs text-text-secondary font-medium">크레딧:</span>
                      <button onClick={() => updateCredits(s.id, -1)} className="w-7 h-7 flex items-center justify-center rounded-md border border-border hover:bg-gray-100 transition-colors">
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-bold w-8 text-center">{s.credits}</span>
                      <button onClick={() => updateCredits(s.id, 1)} className="w-7 h-7 flex items-center justify-center rounded-md border border-border hover:bg-gray-100 transition-colors">
                        <Plus size={12} />
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={creditInput[s.id] || ''}
                        onChange={(e) => setCreditInput(prev => ({ ...prev, [s.id]: e.target.value }))}
                        placeholder="직접 입력"
                        className="w-20 px-2 py-1 text-xs rounded border border-border focus:outline-none focus:border-primary"
                      />
                      <button
                        onClick={() => setCredits(s.id)}
                        className="text-xs px-2 py-1 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
                      >
                        설정
                      </button>
                      {s.id !== user.id && (
                        <button
                          onClick={() => toggleRole(s.id, s.role)}
                          className="ml-auto flex items-center gap-1 text-xs px-2 py-1 rounded border border-border hover:bg-gray-100 transition-colors"
                        >
                          <Shield size={11} />
                          {s.role === 'student' ? '선생님 권한 부여' : '학생으로 변경'}
                        </button>
                      )}
                    </div>

                    {/* 이 학생의 제출 내역 */}
                    {expandedSubmissions.length === 0 ? (
                      <p className="text-xs text-text-secondary">제출 내역이 없습니다.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-60 overflow-y-auto">
                        {expandedSubmissions.map((sub) => (
                          <div key={sub.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-border">
                            <div className="flex items-center gap-2">
                              {sub._type === 'writing' ? (
                                <PenLine size={13} className="text-primary shrink-0" />
                              ) : (
                                <Mic size={13} className="text-primary shrink-0" />
                              )}
                              <span className="text-xs font-medium">
                                {sub._type === 'writing'
                                  ? `${sub.task_type === 'task1' ? 'Task 1' : 'Task 2'} · ${sub.word_count}w`
                                  : `${sub.part?.replace('part', 'Part ')} · ${sub.question?.slice(0, 30)}...`
                                }
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-sm font-bold ${bandColor(sub.overall_band)}`}>
                                {sub.overall_band}
                              </span>
                              <span className="text-[10px] text-text-secondary">{formatDate(sub.created_at)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          {filteredStudents.length === 0 && (
            <p className="text-center text-text-secondary py-8">검색 결과가 없습니다.</p>
          )}
        </div>
      )}

      {/* All Submissions Tab */}
      {tab === 'submissions' && (
        <div className="space-y-2">
          {submissions
            .filter(sub => {
              if (!search) return true
              const student = students.find(s => s.id === sub.user_id)
              return student?.display_name?.toLowerCase().includes(search.toLowerCase()) ||
                     student?.email?.toLowerCase().includes(search.toLowerCase())
            })
            .map((sub) => {
              const student = students.find(s => s.id === sub.user_id)
              return (
                <div key={sub.id} className="bg-surface rounded-xl border border-border p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {sub._type === 'writing' ? (
                      <PenLine size={16} className="text-primary shrink-0" />
                    ) : (
                      <Mic size={16} className="text-primary shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {student?.display_name || '알 수 없음'}
                        <span className="text-text-secondary font-normal ml-2">
                          {sub._type === 'writing'
                            ? `${sub.task_type === 'task1' ? 'Task 1' : 'Task 2'} · ${sub.word_count}w`
                            : `${sub.part?.replace('part', 'Part ')}`
                          }
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary">{formatDate(sub.created_at)}</p>
                    </div>
                  </div>
                  <span className={`text-lg font-bold ${bandColor(sub.overall_band)}`}>
                    {sub.overall_band}
                  </span>
                </div>
              )
            })
          }
          {submissions.length === 0 && (
            <p className="text-center text-text-secondary py-8">제출 내역이 없습니다.</p>
          )}
        </div>
      )}
    </div>
  )
}
