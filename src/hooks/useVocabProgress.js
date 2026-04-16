import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

// 로그인 유저 → Supabase, 비로그인 → localStorage (fallback)
export function useVocabProgress() {
  const { user } = useAuth()
  const [progressMap, setProgressMap] = useState({}) // { 'band56_education': 10, ... }
  const [loaded, setLoaded] = useState(false)

  // 초기 로드
  useEffect(() => {
    if (user) {
      loadFromSupabase()
    } else {
      loadFromLocalStorage()
    }
  }, [user])

  const loadFromSupabase = async () => {
    const { data } = await supabase
      .from('vocab_progress')
      .select('band_id, topic_id, progress')
      .eq('user_id', user.id)

    const map = {}
    data?.forEach(row => {
      map[`${row.band_id}_${row.topic_id}`] = row.progress
    })
    setProgressMap(map)
    setLoaded(true)

    // localStorage → Supabase 마이그레이션 (한 번만)
    migrateLocalToSupabase(map)
  }

  const migrateLocalToSupabase = async (existingMap) => {
    const migrated = localStorage.getItem('vocab_progress_migrated')
    if (migrated) return

    const toMigrate = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('vocab_progress_') && key !== 'vocab_progress_migrated') {
        const parts = key.replace('vocab_progress_', '').split('_')
        if (parts.length === 2) {
          const [bandId, topicId] = parts
          const val = parseInt(localStorage.getItem(key), 10)
          if (val > 0 && (!existingMap[`${bandId}_${topicId}`] || val > existingMap[`${bandId}_${topicId}`])) {
            toMigrate.push({ user_id: user.id, band_id: bandId, topic_id: topicId, progress: val })
          }
        }
      }
    }

    if (toMigrate.length > 0) {
      await supabase.from('vocab_progress').upsert(toMigrate, { onConflict: 'user_id,band_id,topic_id' })
      // 마이그레이션 후 다시 로드
      const { data } = await supabase
        .from('vocab_progress')
        .select('band_id, topic_id, progress')
        .eq('user_id', user.id)
      const map = {}
      data?.forEach(row => {
        map[`${row.band_id}_${row.topic_id}`] = row.progress
      })
      setProgressMap(map)
    }

    localStorage.setItem('vocab_progress_migrated', '1')
  }

  const loadFromLocalStorage = () => {
    const map = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('vocab_progress_') && key !== 'vocab_progress_migrated') {
        const parts = key.replace('vocab_progress_', '').split('_')
        if (parts.length === 2) {
          const val = parseInt(localStorage.getItem(key), 10)
          if (val > 0) map[`${parts[0]}_${parts[1]}`] = val
        }
      }
    }
    setProgressMap(map)
    setLoaded(true)
  }

  const getProgress = useCallback((bandId, topicId) => {
    return progressMap[`${bandId}_${topicId}`] || 0
  }, [progressMap])

  const saveProgress = useCallback(async (bandId, topicId, index) => {
    const key = `${bandId}_${topicId}`
    const prev = progressMap[key] || 0
    if (index <= prev) return // 최고 기록만 저장

    // 즉시 UI 반영
    setProgressMap(prev => ({ ...prev, [key]: index }))

    if (user) {
      await supabase.from('vocab_progress').upsert(
        { user_id: user.id, band_id: bandId, topic_id: topicId, progress: index, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,band_id,topic_id' }
      )
    } else {
      localStorage.setItem(`vocab_progress_${bandId}_${topicId}`, String(index))
    }
  }, [progressMap, user])

  return { getProgress, saveProgress, loaded }
}
