import { useState, useRef, useCallback } from 'react'

export default function useTimer(initialSeconds, onComplete) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)

  const start = useCallback(() => {
    if (intervalRef.current) return
    setRunning(true)
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
          setRunning(false)
          onComplete?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [onComplete])

  const stop = useCallback(() => {
    clearInterval(intervalRef.current)
    intervalRef.current = null
    setRunning(false)
  }, [])

  const reset = useCallback((newSeconds) => {
    clearInterval(intervalRef.current)
    intervalRef.current = null
    setRunning(false)
    setSeconds(newSeconds ?? initialSeconds)
  }, [initialSeconds])

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return { seconds, running, start, stop, reset, formatted: formatTime(seconds) }
}
