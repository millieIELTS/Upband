import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'

function detectInAppBrowser() {
  const ua = navigator.userAgent || ''
  if (/KAKAOTALK/i.test(ua)) return 'kakao'
  if (/Instagram/i.test(ua)) return 'instagram'
  if (/FBAN|FBAV/i.test(ua)) return 'facebook'
  if (/Line/i.test(ua)) return 'line'
  if (/NAVER/i.test(ua)) return 'naver'
  if (/wv\)/i.test(ua)) return 'webview'
  return null
}

export default function Login() {
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [inApp, setInApp] = useState(null)
  const { signInWithGoogle } = useAuth()

  useEffect(() => {
    setInApp(detectInAppBrowser() || (new URLSearchParams(window.location.search).get('inapp')))
  }, [])

  const handleGoogle = async () => {
    setError('')
    if (inApp) return // 인앱 브라우저면 버튼 비활성화 + 안내만 표시
    const { error: authError } = await signInWithGoogle()
    if (authError) setError(authError.message)
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = window.location.href
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="max-w-sm mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold text-center mb-2">로그인</h1>
      <p className="text-center text-text-secondary text-sm mb-8">
        Google 계정으로 간편하게 시작하세요
      </p>

      {/* 🚨 인앱 브라우저 감지 시 안내 */}
      {inApp && (
        <div className="mb-6 p-4 rounded-xl bg-yellow-50 border border-yellow-300">
          <div className="flex items-start gap-2 mb-3">
            <span className="text-xl flex-shrink-0">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-text mb-1">
                {inApp === 'kakao' && '카카오톡'}
                {inApp === 'instagram' && '인스타그램'}
                {inApp === 'facebook' && '페이스북'}
                {inApp === 'line' && '라인'}
                {inApp === 'naver' && '네이버'}
                {inApp === 'webview' && '인앱'} 브라우저에서는 Google 로그인이 막혀있어요
              </p>
              <p className="text-xs text-text-secondary leading-relaxed">
                Google 보안 정책상, 외부 브라우저(Chrome/Safari)에서만 로그인할 수 있어요.
              </p>
            </div>
          </div>

          <div className="bg-surface rounded-lg p-3 mb-3 text-xs text-text leading-relaxed">
            <p className="font-semibold mb-1.5">📱 해결 방법</p>
            {inApp === 'kakao' && (
              <ol className="space-y-1 list-decimal list-inside text-text-secondary">
                <li>아래 버튼으로 <strong className="text-text">URL을 복사</strong>하세요</li>
                <li>우측 상단 <strong className="text-text">⋮ 메뉴 → "다른 브라우저로 열기"</strong></li>
                <li>Chrome/Safari에 URL을 붙여넣고 로그인</li>
              </ol>
            )}
            {inApp === 'instagram' && (
              <ol className="space-y-1 list-decimal list-inside text-text-secondary">
                <li>아래 버튼으로 <strong className="text-text">URL을 복사</strong>하세요</li>
                <li>우측 상단 <strong className="text-text">⋯ 메뉴 → "외부 브라우저에서 열기"</strong></li>
                <li>Chrome/Safari에 URL을 붙여넣고 로그인</li>
              </ol>
            )}
            {inApp !== 'kakao' && inApp !== 'instagram' && (
              <ol className="space-y-1 list-decimal list-inside text-text-secondary">
                <li>아래 버튼으로 <strong className="text-text">URL을 복사</strong>하세요</li>
                <li>Chrome 또는 Safari를 열어주세요</li>
                <li>URL을 붙여넣고 로그인</li>
              </ol>
            )}
          </div>

          <button
            onClick={handleCopyUrl}
            className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-primary text-white hover:bg-primary-dark'
            }`}
          >
            {copied ? '✅ URL이 복사되었어요!' : '📋 페이지 URL 복사하기'}
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-error/10 text-error text-sm">{error}</div>
      )}

      <button
        onClick={handleGoogle}
        disabled={!!inApp}
        className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-surface border border-border rounded-xl font-medium text-sm hover:bg-gray-50 hover:border-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
