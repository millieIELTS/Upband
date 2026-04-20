import { useCallback, useEffect, useState } from 'react'

// 리스닝 받아쓰기 진행도 (localStorage 전용)
// - 무료 연습 기능이라 Supabase 테이블 없이 디바이스별 저장
// - key: listening_progress_{bandId} = 다음에 풀어야 할 문장 index
export function useListeningProgress() {
  const [progressMap, setProgressMap] = useState({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const map = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('listening_progress_')) {
        const bandId = key.replace('listening_progress_', '')
        const val = parseInt(localStorage.getItem(key), 10)
        if (!isNaN(val) && val > 0) map[bandId] = val
      }
    }
    setProgressMap(map)
    setLoaded(true)
  }, [])

  const getProgress = useCallback((bandId) => progressMap[bandId] || 0, [progressMap])

  const saveProgress = useCallback((bandId, index) => {
    setProgressMap((prev) => ({ ...prev, [bandId]: index }))
    localStorage.setItem(`listening_progress_${bandId}`, String(index))
  }, [])

  const resetProgress = useCallback((bandId) => {
    setProgressMap((prev) => {
      const next = { ...prev }
      delete next[bandId]
      return next
    })
    localStorage.removeItem(`listening_progress_${bandId}`)
  }, [])

  return { getProgress, saveProgress, resetProgress, loaded }
}
