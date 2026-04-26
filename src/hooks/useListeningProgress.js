import { useCallback, useEffect, useState } from 'react'

// 리스닝 받아쓰기 진행도 (localStorage 전용)
// - 무료 연습 기능이라 Supabase 테이블 없이 디바이스별 저장
// - key: listening_progress_{bandId}_{topicId} = 다음에 풀어야 할 문장 index
export function useListeningProgress() {
  const [progressMap, setProgressMap] = useState({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const map = {}
    const orphanedKeys = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key?.startsWith('listening_progress_')) continue
      const tail = key.replace('listening_progress_', '')
      // 새 형식: bandId_topicId (예: 4-5_education)
      // 옛 형식: bandId만 (예: 4-5) — 마이그레이션 불가, 정리
      const parts = tail.split('_')
      if (parts.length < 2) {
        orphanedKeys.push(key)
        continue
      }
      const val = parseInt(localStorage.getItem(key), 10)
      if (!isNaN(val) && val > 0) map[tail] = val
    }
    // 옛 형식 키 정리
    orphanedKeys.forEach((k) => localStorage.removeItem(k))
    setProgressMap(map)
    setLoaded(true)
  }, [])

  const composeKey = (bandId, topicId) => `${bandId}_${topicId}`

  const getProgress = useCallback(
    (bandId, topicId) => progressMap[composeKey(bandId, topicId)] || 0,
    [progressMap]
  )

  const saveProgress = useCallback((bandId, topicId, index) => {
    const key = composeKey(bandId, topicId)
    setProgressMap((prev) => ({ ...prev, [key]: index }))
    localStorage.setItem(`listening_progress_${key}`, String(index))
  }, [])

  const resetProgress = useCallback((bandId, topicId) => {
    const key = composeKey(bandId, topicId)
    setProgressMap((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    localStorage.removeItem(`listening_progress_${key}`)
  }, [])

  return { getProgress, saveProgress, resetProgress, loaded }
}
