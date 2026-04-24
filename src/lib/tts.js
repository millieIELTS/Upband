// Edge TTS — 자연스러운 AI 음성 (영국/호주/미국 혼합)
// Vercel serverless 함수를 통해 음성 생성

const VOICES = [
  'en-GB-SoniaNeural',   // 영국 여성
  'en-GB-ThomasNeural',  // 영국 남성
  'en-AU-WilliamNeural', // 호주 남성
  'en-US-GuyNeural',     // 미국 남성
  'en-AU-NatashaNeural', // 호주 여성
]

// 음성 캐시 (같은 텍스트 반복 재생 시 재요청 방지)
const audioCache = new Map()
let currentAudio = null

// 재생 세션 ID — stopPlaying() 호출 시 증가해서 pending 비동기 재생을 무효화
// (페이지 이탈 시 fetch가 끝난 뒤 오디오가 뒤늦게 재생되는 문제 방지)
let playbackId = 0

// 세션 음성 — 토픽 진입 시 한 번 정해지면 그 토픽 내에서 유지
let sessionVoice = null

// 토픽 진입 시 호출 — 새 음성 랜덤 배정
export function pickSessionVoice() {
  sessionVoice = VOICES[Math.floor(Math.random() * VOICES.length)]
  return sessionVoice
}

function getVoice() {
  if (!sessionVoice) pickSessionVoice()
  return sessionVoice
}

export async function speakQuestion(text, onEnd) {
  // 이전 재생 중지
  if (currentAudio) {
    currentAudio.pause()
    currentAudio = null
  }

  // 이번 재생의 고유 ID — fetch 진행 중에 stopPlaying() 호출되면 중단
  const myId = ++playbackId

  try {
    let audioUrl = audioCache.get(text)

    if (!audioUrl) {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: getVoice() }),
      })

      // fetch 중에 stop 되었으면 (페이지 이탈 등) 재생하지 않음
      if (myId !== playbackId) return

      if (!res.ok) throw new Error('TTS 요청 실패')

      const blob = await res.blob()

      if (myId !== playbackId) return

      audioUrl = URL.createObjectURL(blob)
      audioCache.set(text, audioUrl)
    }

    // 캐시 조회 후에도 한 번 더 체크 (비동기 중에 stop 됐을 수 있음)
    if (myId !== playbackId) return

    const audio = new Audio(audioUrl)
    currentAudio = audio

    audio.onended = () => {
      if (currentAudio === audio) currentAudio = null
      if (onEnd) onEnd()
    }

    audio.onerror = () => {
      if (currentAudio === audio) currentAudio = null
      if (myId !== playbackId) return
      speakFallback(text, onEnd)
    }

    await audio.play()
  } catch (err) {
    if (myId !== playbackId) return
    console.error('Edge TTS error, falling back:', err)
    speakFallback(text, onEnd)
  }
}

// 폴백: 서버 TTS 실패 시 브라우저 내장 TTS 사용
function speakFallback(text, onEnd) {
  speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-GB'
  utterance.rate = 0.88
  if (onEnd) utterance.onend = onEnd
  speechSynthesis.speak(utterance)
}

// 재생만 멈추기 (세션 음성 유지 — 질문 전환용)
// 이 함수 호출 시 playbackId를 증가시켜서 pending fetch도 무효화됨
export function stopPlaying() {
  playbackId++
  if (currentAudio) {
    currentAudio.pause()
    currentAudio = null
  }
  speechSynthesis.cancel()
}

// 완전 정지 + 세션 초기화 (페이지 이탈용)
export function stopSpeaking() {
  stopPlaying()
  sessionVoice = null
}
