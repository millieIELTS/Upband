import { useState, useEffect, createContext, useContext } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    // 1. 먼저 리스너 등록 (OAuth 콜백 토큰 감지)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        if (currentUser) {
          await fetchProfile(currentUser)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    // 2. 기존 세션 확인
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        await fetchProfile(currentUser)
      } else {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(authUser) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (data) {
      setProfile(data)
      setLoading(false)
      return
    }

    // 프로필이 없으면 (트리거 아직 안 됐거나 실패) 직접 생성 시도
    const displayName =
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      authUser.email?.split('@')[0] ||
      '사용자'

    const { data: newProfile } = await supabase
      .from('profiles')
      .upsert({
        id: authUser.id,
        email: authUser.email,
        display_name: displayName,
        role: 'student',
        credits: 3,
      }, { onConflict: 'id' })
      .select()
      .single()

    setProfile(newProfile)
    setLoading(false)
  }

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
    await supabase.auth.signOut()
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
