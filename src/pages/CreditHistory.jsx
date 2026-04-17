import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Coins, ArrowLeft, Plus, Minus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const REASON_LABELS = {
  writing_feedback: 'Writing AI 피드백',
  ebook_purchase: 'E-Book 구매',
  admin_grant: '관리자 지급',
  admin_adjust: '관리자 조정',
  signup_bonus: '가입 보너스',
  refund: '환불',
}

function formatDate(dateString) {
  const d = new Date(dateString)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function CreditHistory() {
  const { user, profile, loading: authLoading } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('credit_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setLogs(data || [])
        setLoading(false)
      })
  }, [user])

  if (authLoading) return null

  if (!user) {
    return (
      <div className="text-center py-16">
        <Coins size={48} className="text-text-secondary mx-auto mb-4" />
        <p className="text-text-secondary mb-6">로그인 후 이용할 수 있습니다.</p>
        <Link to="/login" className="text-primary no-underline">로그인하기</Link>
      </div>
    )
  }

  const totalEarned = logs.filter(l => l.amount > 0).reduce((sum, l) => sum + l.amount, 0)
  const totalSpent = logs.filter(l => l.amount < 0).reduce((sum, l) => sum + Math.abs(l.amount), 0)

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/mypage" className="inline-flex items-center gap-1 text-sm text-text-secondary mb-4 no-underline hover:text-primary">
        <ArrowLeft size={14} /> 마이페이지
      </Link>

      <h1 className="text-2xl font-bold mb-6">크레딧 사용 내역</h1>

      {/* 현재 잔액 + 통계 */}
      <div className="bg-surface rounded-xl border border-border p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-text-secondary">현재 잔액</p>
          <div className="flex items-center gap-1 text-accent">
            <Coins size={20} />
            <span className="text-2xl font-bold">{profile?.credits ?? 0}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-xs text-text-secondary mb-1">총 획득</p>
            <p className="text-lg font-bold text-emerald-600">+{totalEarned}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-text-secondary mb-1">총 사용</p>
            <p className="text-lg font-bold text-red-500">-{totalSpent}</p>
          </div>
        </div>
      </div>

      {/* 로그 목록 */}
      {loading ? (
        <div className="text-center py-8 text-text-secondary text-sm">불러오는 중...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-xl border border-border">
          <Coins size={40} className="text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary text-sm">아직 크레딧 사용 내역이 없습니다.</p>
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border divide-y divide-border">
          {logs.map((log) => {
            const isPositive = log.amount > 0
            const label = REASON_LABELS[log.reason] || log.reason || '기타'
            return (
              <div key={log.id} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                  }`}>
                    {isPositive ? <Plus size={16} /> : <Minus size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-text-secondary">{formatDate(log.created_at)}</p>
                  </div>
                </div>
                <p className={`text-base font-bold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                  {isPositive ? '+' : ''}{log.amount}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
