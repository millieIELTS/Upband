import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // 프로필 로딩 (별도 함수로 분리)
  const loadProfile = useCallback(async (authUser) => {
    if (!authUser) {
      setProfile(null)
      setLoading(false)
      return
    }

    try {
      const { data } = await supabase.rpc('get_my_profile').maybeSingle()

      if (data) {
        setProfile(data)
        setLoading(false)
        return
      }

      // 프로필이 없으면 새로 생성
      const displayName =
        authUser.user_metadata?.full_name ||
        authUser.user_metadata?.name ||
        authUser.email?.split('@')[0] ||
        '사용자'

      await supabase.from('profiles').insert({
        id: authUser.id,
        email: authUser.email,
        display_name: displayName,
        role: 'student',
        credits: 3,
      })

      const { data: newProfile } = await supabase.rpc('get_my_profile').maybeSingle()
      setProfile(newProfile)
    } catch (err) {
      console.error('Profile load error:', err)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    let mounted = true

    // 1. 리스너 등록 — 동기 작업만, async 금지 (Supabase 권장)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return
        const currentUser = session?.user ?? null
        setUser(currentUser)

        // setTimeout으로 async 작업을 이벤트 루프 밖으로 빼기
        // (onAuthStateChange 콜백 내에서 await하면 후속 이벤트가 블로킹됨)
        if (currentUser) {
          setTimeout(() => { if (mounted) loadProfile(currentUser) }, 0)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    // 2. 기존 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        loadProfile(currentUser)
      } else {
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [loadProfile])

  // 프로필 새로고침 (크레딧 변경 등에 사용)
  const refreshProfile = useCallback(async () => {
    if (!user) return
    const { data } = await supabase.rpc('get_my_profile').maybeSingle()
    if (data) setProfile(data)
  }, [user])

  async function signUp(email, password, displayName) {
    if (!isSupabaseConfigured) return { error: { message: 'Supabase가 설정되지 않았습니다.' } }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: displayName } },
    })
    return { data, error }
  }

  async function signIn(email, password) {
    if (!isSupabaseConfigured) return { error: { message: 'Supabase가 설정되지 않았습니다.' } }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  async function signInWithGoogle() {
    if (!isSupabaseConfigured) return { error: { message: 'Supabase가 설정되지 않았습니다.' } }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    return { data, error }
  }

  async function signOut() {
    if (!isSupabaseConfigured) return
    try {
      await supabase.auth.signOut({ scope: 'local' })
    } catch (err) {
      console.error('Sign out error:', err)
    }
    // 무조건 로컬 상태 초기화 (서버 에러 무관)
    setUser(null)
    setProfile(null)
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    refreshProfile,
    hasCredits: (profile?.credits ?? 0) > 0,
    isTeacher: profile?.role === 'teacher' || profile?.role === 'admin',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
