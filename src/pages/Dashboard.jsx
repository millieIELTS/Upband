import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, PenLine, Coins, Search,
  ChevronDown, ChevronUp, Plus, Minus, Shield, Eye,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import { BookOpen, FileText } from 'lucide-react'

export default function Dashboard() {
  const { user, profile, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('students')
  const [students, setStudents] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [stats, setStats] = useState({ totalStudents: 0, totalWriting: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedUser, setExpandedUser] = useState(null)
  const [expandedSubmissions, setExpandedSubmissions] = useState([])
  const [creditInput, setCreditInput] = useState({})
  const [selectedSubmission, setSelectedSubmission] = useState(null)

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

    // 모의고사는 별도 페이지(/dashboard/mock-tests)에서 관리 — 일반 라이팅 목록에서는 제외
    const regularWriting = (allWriting || []).filter(s => !s.feedback_json?.mock_test_id)
    const mockWriting = (allWriting || []).filter(s => s.feedback_json?.mock_test_id)

    setStudents(allProfiles || [])
    setSubmissions(
      regularWriting
        .map(s => ({ ...s, _type: 'writing' }))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    )

    setStats({
      totalStudents: (allProfiles || []).filter(p => p.role === 'student').length,
      totalWriting: regularWriting.length,
      totalMock: mockWriting.length,
      unreviewedWriting: regularWriting.filter(s => !s.reviewed).length,
      unreviewedMock: mockWriting.filter(s => !s.reviewed).length,
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
      setSelectedSubmission(null)
    } else {
      setExpandedUser(userId)
      setExpandedSubmissions(submissions.filter(s => s.user_id === userId))
      setSelectedSubmission(null)
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
      <div className="grid grid-cols-2 gap-3 mb-6">
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
      </div>

      {/* 제출 내역 관리 바로가기 (일반 Writing) */}
      <Link
        to="/dashboard/submissions"
        className="block mb-3 p-4 bg-accent/5 border border-accent/20 rounded-xl no-underline hover:bg-accent/10 transition-colors"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Eye size={18} className="text-accent shrink-0" />
            <span className="text-sm font-medium text-text">제출 내역 관리</span>
            <span className="text-xs text-text-secondary truncate">일반 Writing · 확인여부 체크</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {stats.unreviewedWriting > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-error text-white text-[10px] font-bold">
                미채점 {stats.unreviewedWriting}
              </span>
            )}
            <span className="text-xs text-accent font-medium">바로가기 →</span>
          </div>
        </div>
      </Link>

      {/* 모의고사 채점 바로가기 */}
      <Link
        to="/dashboard/mock-tests"
        className="block mb-3 p-4 bg-amber-50 border border-amber-200 rounded-xl no-underline hover:bg-amber-100 transition-colors"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <FileText size={18} className="text-amber-600 shrink-0" />
            <span className="text-sm font-medium text-text">모의고사 채점</span>
            <span className="text-xs text-text-secondary truncate">Writing 모의고사 응시 채점</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {stats.unreviewedMock > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-error text-white text-[10px] font-bold">
                미채점 {stats.unreviewedMock}
              </span>
            )}
            <span className="text-xs text-amber-600 font-medium">바로가기 →</span>
          </div>
        </div>
      </Link>

      {/* 전자책 관리 바로가기 */}
      <Link
        to="/dashboard/ebooks"
        className="block mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl no-underline hover:bg-emerald-100 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-emerald-600" />
            <span className="text-sm font-medium text-text">전자책 관리</span>
            <span className="text-xs text-text-secondary">PDF 등록 · 가격 설정 · 공개/비공개</span>
          </div>
          <span className="text-xs text-emerald-600 font-medium">바로가기 →</span>
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
                      <PenLine size={12} /> {userSubmissions.length}
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
                      <div className="space-y-1.5">
                        <div className="space-y-1.5 max-h-60 overflow-y-auto">
                          {expandedSubmissions.map((sub) => (
                            <div
                              key={sub.id}
                              onClick={() => setSelectedSubmission(selectedSubmission?.id === sub.id ? null : sub)}
                              className={`flex items-center justify-between bg-white rounded-lg px-3 py-2 border cursor-pointer transition-colors ${
                                selectedSubmission?.id === sub.id
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/40 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <PenLine size={13} className="text-primary shrink-0" />
                                <span className="text-xs font-medium">
                                  {sub.task_type === 'task1' ? 'Task 1' : 'Task 2'} · {sub.word_count}w
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                {(sub.teacher_band ?? sub.overall_band) != null ? (
                                  <span className={`text-sm font-bold ${bandColor(sub.teacher_band ?? sub.overall_band)}`}>
                                    {sub.teacher_band ?? sub.overall_band}
                                  </span>
                                ) : (
                                  <span className="text-xs text-text-secondary">미채점</span>
                                )}
                                <span className="text-[10px] text-text-secondary">{formatDate(sub.created_at)}</span>
                                <Eye size={12} className={selectedSubmission?.id === sub.id ? 'text-primary' : 'text-text-secondary'} />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* 선택한 제출물 상세 보기 */}
                        {selectedSubmission && selectedSubmission.user_id === s.id && (
                          <div className="mt-3 bg-white rounded-xl border border-primary/20 p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold text-primary">Writing 상세</h4>
                              <button
                                onClick={() => setSelectedSubmission(null)}
                                className="text-xs text-text-secondary hover:text-primary"
                              >
                                닫기
                              </button>
                            </div>

                            {/* 문제 */}
                            {selectedSubmission.question && (
                              <div>
                                <p className="text-xs font-medium text-text-secondary mb-1">문제</p>
                                <p className="text-sm bg-bg p-3 rounded-lg border border-border">{selectedSubmission.question}</p>
                              </div>
                            )}

                            {/* 에세이 */}
                            {selectedSubmission.essay && (
                              <div>
                                <p className="text-xs font-medium text-text-secondary mb-1">에세이</p>
                                <div className="text-sm bg-bg p-3 rounded-lg border border-border whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                                  {selectedSubmission.essay}
                                </div>
                              </div>
                            )}

                            {/* AI 밴드 점수 */}
                            {selectedSubmission.overall_band != null && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-text-secondary">AI 채점:</span>
                                <span className={`text-sm font-bold ${bandColor(selectedSubmission.overall_band)}`}>
                                  Band {selectedSubmission.overall_band}
                                </span>
                              </div>
                            )}

                            {/* AI 피드백 */}
                            {selectedSubmission.feedback && (
                              <div>
                                <p className="text-xs font-medium text-text-secondary mb-1">AI 피드백</p>
                                <div className="text-sm bg-bg p-3 rounded-lg border border-border whitespace-pre-wrap leading-relaxed">
                                  {selectedSubmission.feedback}
                                </div>
                              </div>
                            )}

                            {/* 선생님 채점/피드백 */}
                            {selectedSubmission.teacher_band != null && (
                              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium text-primary">선생님 채점</span>
                                  <span className={`text-sm font-bold ${bandColor(selectedSubmission.teacher_band)}`}>
                                    Band {selectedSubmission.teacher_band}
                                  </span>
                                </div>
                                {selectedSubmission.teacher_feedback && (
                                  <p className="text-sm text-text whitespace-pre-wrap">{selectedSubmission.teacher_feedback}</p>
                                )}
                              </div>
                            )}
                          </div>
                        )}
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
                    <PenLine size={16} className="text-primary shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {student?.display_name || '알 수 없음'}
                        <span className="text-text-secondary font-normal ml-2">
                          {sub.task_type === 'task1' ? 'Task 1' : 'Task 2'} · {sub.word_count}w
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary">{formatDate(sub.created_at)}</p>
                    </div>
                  </div>
                  {(sub.teacher_band ?? sub.overall_band) != null ? (
                    <span className={`text-lg font-bold ${bandColor(sub.teacher_band ?? sub.overall_band)}`}>
                      {sub.teacher_band ?? sub.overall_band}
                    </span>
                  ) : (
                    <span className="text-sm text-text-secondary">미채점</span>
                  )}
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
