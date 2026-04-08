import { Link, useNavigate } from 'react-router-dom'
import { User, PenLine, Mic, Coins, Settings, LogIn, ChevronRight } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useState, useEffect } from 'react'
import { getWritingHistory, getSpeakingHistory } from '../lib/submissions'

export default function MyPage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ writing: 0, speaking: 0, avgBand: null })

  useEffect(() => {
    if (!user) return
    refreshProfile()
    Promise.all([
      getWritingHistory(user.id),
      getSpeakingHistory(user.id),
    ]).then(([w, s]) => {
      const wData = w.data || []
      const sData = s.data || []
      const all = [...wData, ...sData]
      const avg = all.length > 0
        ? (all.reduce((sum, i) => sum + Number(i.overall_band), 0) / all.length).toFixed(1)
        : null
      setStats({ writing: wData.length, speaking: sData.length, avgBand: avg })
    })
  }, [user])

  if (authLoading) return null

  if (!user) {
    return (
      <div className="text-center py-16">
        <User size={48} className="text-text-secondary mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">마이페이지</h1>
        <p className="text-text-secondary mb-6">로그인 후 이용할 수 있습니다.</p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium text-sm no-underline hover:bg-primary-dark transition-colors"
        >
          <LogIn size={16} /> 로그인
        </Link>
      </div>
    )
  }

  const bandColor = (score) => {
    if (!score) return 'text-text-secondary'
    if (score >= 7) return 'text-band-high'
    if (score >= 6) return 'text-band-mid'
    return 'text-band-low'
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">마이페이지</h1>

      {/* Profile card */}
      <div className="bg-surface rounded-xl border border-border p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={28} className="text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">{profile?.display_name || '사용자'}</h2>
            <p className="text-sm text-text-secondary">{user.email}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                {profile?.role === 'teacher' ? '선생님' : profile?.role === 'admin' ? '관리자' : '학생'}
              </span>
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1 text-accent">
              <Coins size={18} />
              <span className="text-2xl font-bold">{profile?.credits ?? 0}</span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">크레딧</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-surface rounded-xl border border-border p-4 text-center">
          <PenLine size={20} className="text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold">{stats.writing}</p>
          <p className="text-xs text-text-secondary">Writing 제출</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4 text-center">
          <Mic size={20} className="text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold">{stats.speaking}</p>
          <p className="text-xs text-text-secondary">Speaking 제출</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4 text-center">
          <div className={`text-2xl font-bold ${bandColor(stats.avgBand)}`}>
            {stats.avgBand ?? '-'}
          </div>
          <p className="text-xs text-text-secondary mt-2">평균 Band</p>
        </div>
      </div>

      {/* Menu */}
      <div className="bg-surface rounded-xl border border-border divide-y divide-border">
        <Link
          to="/history"
          className="flex items-center justify-between px-5 py-4 no-underline text-text hover:bg-gray-50 transition-colors rounded-t-xl"
        >
          <div className="flex items-center gap-3">
            <PenLine size={18} className="text-text-secondary" />
            <span className="text-sm font-medium">제출 히스토리</span>
          </div>
          <ChevronRight size={16} className="text-text-secondary" />
        </Link>
        <Link
          to="/settings"
          className="flex items-center justify-between px-5 py-4 no-underline text-text hover:bg-gray-50 transition-colors rounded-b-xl"
        >
          <div className="flex items-center gap-3">
            <Settings size={18} className="text-text-secondary" />
            <span className="text-sm font-medium">회원정보 관리</span>
          </div>
          <ChevronRight size={16} className="text-text-secondary" />
        </Link>
      </div>
    </div>
  )
}
