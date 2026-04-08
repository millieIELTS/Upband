import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const [error, setError] = useState('')
  const { signInWithGoogle } = useAuth()

  const isInAppBrowser = () => {
    const ua = navigator.userAgent || ''
    return /FBAN|FBAV|Instagram|SamsungBrowser.*CrossApp|NAVER|Line|KakaoTalk|wv\)/i.test(ua)
  }

  const handleGoogle = async () => {
    setError('')
    if (isInAppBrowser()) {
      setError('인앱 브라우저에서는 Google 로그인이 지원되지 않습니다. 우측 상단 ⋮ 메뉴에서 "Chrome으로 열기" 또는 "외부 브라우저로 열기"를 선택해주세요.')
      return
    }
    const { error: authError } = await signInWithGoogle()
    if (authError) setError(authError.message)
  }

  return (
    <div className="max-w-sm mx-auto py-16">
      <h1 className="text-2xl font-bold text-center mb-2">로그인</h1>
      <p className="text-center text-text-secondary text-sm mb-8">
        Google 계정으로 간편하게 시작하세요
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-error/10 text-error text-sm">{error}</div>
      )}

      <button
        onClick={handleGoogle}
        className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-surface border border-border rounded-xl font-medium text-sm hover:bg-gray-50 hover:border-primary/30 transition-all"
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Google로 로그인
      </button>

      <p className="text-center text-xs text-text-secondary mt-6">
        처음 로그인하면 자동으로 계정이 생성됩니다
      </p>
    </div>
  )
}
