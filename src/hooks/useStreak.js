import { useCallback, useEffect, useState } from 'react'

// 🔥 연속 학습일 스트릭 (localStorage 기반, 디바이스별 저장)
// - 활동(받아쓰기·단어·라이팅 등) 종료 시 recordActivity() 호출
// - 오늘 이미 찍혔으면 no-op
// - 어제 마지막 활동이면 streak + 1
// - 그 외(2일 이상 공백)면 streak = 1 (리셋 후 새로 시작)

const STREAK_KEY = 'upband_streak_v1'

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

export function useStreak() {
  const [state, setState] = useState(() => readState())

  // 다른 탭/페이지에서 기록했을 경우 focus 시 최신값 반영
  useEffect(() => {
    const sync = () => setState(readState())
    window.addEventListener('focus', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('focus', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const recordActivity = useCallback(() => {
    const today = ymd()
    const current = readState()

    if (current.lastDate === today) return // 이미 오늘 기록됨

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
  }, [])

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
  }
}
