import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, User, Save, Loader2, LogOut, Trash2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export default function Settings() {
  const { user, profile, signOut, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // 비밀번호 변경 (이메일 로그인 사용자만)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)

  const isGoogleUser = user?.app_metadata?.provider === 'google'

  useEffect(() => {
    if (!authLoading && !user) navigate('/login')
  }, [authLoading, user, navigate])

  if (authLoading || !user) return null

  const handleSaveName = async (e) => {
    e.preventDefault()
    if (!displayName.trim()) return
    setSaving(true)
    setMessage('')

    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName.trim(), updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (error) {
      setMessage('저장에 실패했습니다: ' + error.message)
    } else {
      setMessage('이름이 변경되었습니다.')
    }
    setSaving(false)
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordMessage('')

    if (newPassword.length < 6) {
      setPasswordMessage('비밀번호는 6자 이상이어야 합니다.')
      return
    }
    if (newPassword !== newPasswordConfirm) {
      setPasswordMessage('새 비밀번호가 일치하지 않습니다.')
      return
    }

    setPasswordSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setPasswordMessage('변경 실패: ' + error.message)
    } else {
      setPasswordMessage('비밀번호가 변경되었습니다.')
      setCurrentPassword('')
      setNewPassword('')
      setNewPasswordConfirm('')
    }
    setPasswordSaving(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const handleDeleteAccount = async () => {
    // 프로필 삭제 (cascade로 관련 데이터도 삭제됨)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id)

    if (error) {
      setMessage('계정 삭제에 실패했습니다: ' + error.message)
      return
    }

    await signOut()
    navigate('/')
  }

  return (
    <div>
      <Link
        to="/mypage"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-4 no-underline"
      >
        <ArrowLeft size={14} /> 마이페이지로 돌아가기
      </Link>

      <h1 className="text-2xl font-bold mb-6">회원정보 관리</h1>

      {/* 기본 정보 */}
      <div className="bg-surface rounded-xl border border-border p-6 mb-4">
        <h2 className="text-base font-semibold mb-4">기본 정보</h2>

        <div className="mb-4">
          <label className="block text-xs text-text-secondary mb-1">이메일</label>
          <p className="text-sm bg-bg rounded-lg px-4 py-2.5 text-text-secondary">{user.email}</p>
        </div>

        <div className="mb-4">
          <label className="block text-xs text-text-secondary mb-1">로그인 방식</label>
          <p className="text-sm bg-bg rounded-lg px-4 py-2.5 text-text-secondary">
            {isGoogleUser ? 'Google 계정' : '이메일/비밀번호'}
          </p>
        </div>

        <form onSubmit={handleSaveName}>
          <label className="block text-xs text-text-secondary mb-1">이름</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="표시할 이름"
            />
            <button
              type="submit"
              disabled={saving || !displayName.trim()}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              저장
            </button>
          </div>
          {message && (
            <p className={`text-xs mt-2 ${message.includes('실패') ? 'text-error' : 'text-success'}`}>{message}</p>
          )}
        </form>
      </div>

      {/* 비밀번호 변경 (이메일 로그인만) */}
      {!isGoogleUser && (
        <div className="bg-surface rounded-xl border border-border p-6 mb-4">
          <h2 className="text-base font-semibold mb-4">비밀번호 변경</h2>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="block text-xs text-text-secondary mb-1">새 비밀번호</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="6자 이상"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">새 비밀번호 확인</label>
              <input
                type="password"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="비밀번호 재입력"
              />
            </div>
            <button
              type="submit"
              disabled={passwordSaving || !newPassword}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
            >
              {passwordSaving ? <Loader2 size={14} className="animate-spin" /> : null}
              비밀번호 변경
            </button>
            {passwordMessage && (
              <p className={`text-xs ${passwordMessage.includes('실패') ? 'text-error' : 'text-success'}`}>{passwordMessage}</p>
            )}
          </form>
        </div>
      )}

      {/* 로그아웃 & 계정 삭제 */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-text-secondary border border-border hover:bg-gray-50 transition-colors mb-3"
        >
          <LogOut size={16} /> 로그아웃
        </button>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm text-error/60 hover:text-error hover:bg-error/5 transition-colors"
          >
            <Trash2 size={14} /> 계정 삭제
          </button>
        ) : (
          <div className="border border-error/30 rounded-lg p-4 bg-error/5">
            <p className="text-sm text-error font-medium mb-1">정말 계정을 삭제하시겠습니까?</p>
            <p className="text-xs text-text-secondary mb-3">모든 제출 기록과 데이터가 영구적으로 삭제됩니다.</p>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-2 bg-error text-white rounded-lg text-sm font-medium hover:bg-error/90 transition-colors"
              >
                삭제하기
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-sm text-text-secondary hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
