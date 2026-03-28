import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { History as HistoryIcon, PenLine, Mic, LogIn } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { getWritingHistory, getSpeakingHistory } from '../lib/submissions'

export default function History() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('writing')
  const [writingData, setWritingData] = useState([])
  const [speakingData, setSpeakingData] = useState([])
  const [loading, setLoading] = useState(false)

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
    if (score >= 7) return 'text-band-high'
    if (score >= 6) return 'text-band-mid'
    return 'text-band-low'
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">제출 히스토리</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('writing')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'writing' ? 'bg-primary text-white' : 'bg-surface border border-border text-text-secondary'
          }`}
        >
          <PenLine size={14} /> Writing
        </button>
        <button
          onClick={() => setTab('speaking')}
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
        <div className="space-y-3">
          {data.map((item) => (
            <div
              key={item.id}
              className="bg-surface rounded-xl border border-border p-4 flex items-center justify-between hover:border-primary/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={`text-2xl font-bold ${bandColor(item.overall_band)}`}>
                  {item.overall_band}
                </div>
                <div>
                  <div className="text-sm font-medium">
                    {tab === 'writing'
                      ? `${item.task_type === 'task1' ? 'Task 1' : 'Task 2'} · ${item.word_count} words`
                      : `${item.part?.replace('part', 'Part ')} · ${item.question?.slice(0, 40)}...`
                    }
                  </div>
                  <div className="text-xs text-text-secondary">
                    {new Date(item.created_at).toLocaleDateString('ko-KR', {
                      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 text-xs text-text-secondary">
                {tab === 'writing' ? (
                  <>
                    <span>CC {item.score_cc}</span>
                    <span>LR {item.score_lr}</span>
                    <span>GRA {item.score_gra}</span>
                  </>
                ) : (
                  <>
                    <span>F {item.score_fluency}</span>
                    <span>L {item.score_lexical}</span>
                    <span>G {item.score_grammar}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
