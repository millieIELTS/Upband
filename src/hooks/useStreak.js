import { useCallback, useEffect, useState } from 'react'

// 🔥 연속 학습일 스트릭 + 활동 로그 (localStorage 기반, 디바이스별 저장)
// - recordActivity(type?) — 스트릭 갱신 + (type 있으면) 활동 로그에 한 줄 추가
// - countInCurrentMonth(type) — 이번 달 활동 횟수
// - type 예시: 'writing' | 'speaking' | 'vocab' | 'listening'

const STREAK_KEY = 'upband_streak_v1'
const LOG_KEY = 'upband_activity_log_v1'

function ymd(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function yesterdayStr() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return ymd(d)
}

function readState() {
  try {
    const raw = localStorage.getItem(STREAK_KEY)
    if (!raw) return { streak: 0, longest: 0, lastDate: null }
    const parsed = JSON.parse(raw)
    return {
      streak: parsed.streak || 0,
      longest: parsed.longest || 0,
      lastDate: parsed.lastDate || null,
    }
  } catch {
    return { streak: 0, longest: 0, lastDate: null }
  }
}

function writeState(state) {
  localStorage.setItem(STREAK_KEY, JSON.stringify(state))
}

function readLog() {
  try {
    const raw = localStorage.getItem(LOG_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function writeLog(entries) {
  // 90일 지난 엔트리는 자동 프루닝 (localStorage 용량 보호)
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 90)
  const cutoffStr = ymd(cutoff)
  const pruned = entries.filter((e) => e?.date >= cutoffStr)
  localStorage.setItem(LOG_KEY, JSON.stringify(pruned))
  return pruned
}

export function useStreak() {
  const [state, setState] = useState(() => readState())
  const [log, setLog] = useState(() => readLog())

  // 다른 탭/페이지에서 기록했을 경우 focus 시 최신값 반영
  useEffect(() => {
    const sync = () => {
      setState(readState())
      setLog(readLog())
    }
    window.addEventListener('focus', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('focus', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const recordActivity = useCallback((type) => {
    const today = ymd()
    const current = readState()

    // 스트릭 갱신 (오늘 이미 찍혔으면 스킵)
    if (current.lastDate !== today) {
      let newStreak = 1
      if (current.lastDate === yesterdayStr()) {
        newStreak = (current.streak || 0) + 1
      }
      const next = {
        streak: newStreak,
        longest: Math.max(current.longest || 0, newStreak),
        lastDate: today,
      }
      writeState(next)
      setState(next)
    }

    // 활동 로그에 한 줄 추가 (type 지정 시)
    if (type) {
      const currentLog = readLog()
      const nextLog = writeLog([...currentLog, { date: today, type, ts: Date.now() }])
      setLog(nextLog)
    }
  }, [])

  // 이번 달 해당 type의 활동 횟수
  const countInCurrentMonth = useCallback(
    (type) => {
      const now = new Date()
      const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      return log.filter((e) => e?.date?.startsWith(prefix) && (!type || e.type === type)).length
    },
    [log]
  )

  const today = ymd()
  const yest = yesterdayStr()
  // 오늘 또는 어제 활동한 경우만 유효한 스트릭으로 표시
  const effectiveStreak =
    state.lastDate === today || state.lastDate === yest ? state.streak : 0

  return {
    streak: effectiveStreak,
    longest: state.longest || 0,
    lastDate: state.lastDate,
    isActiveToday: state.lastDate === today,
    recordActivity,
    countInCurrentMonth,
  }
}
