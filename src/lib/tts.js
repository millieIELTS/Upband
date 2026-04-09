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

  try {
    let audioUrl = audioCache.get(text)

    if (!audioUrl) {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: getVoice() }),
      })

      if (!res.ok) throw new Error('TTS 요청 실패')

      const blob = await res.blob()
      audioUrl = URL.createObjectURL(blob)
      audioCache.set(text, audioUrl)
    }

    const audio = new Audio(audioUrl)
    currentAudio = audio

    audio.onended = () => {
      currentAudio = null
      if (onEnd) onEnd()
    }

    audio.onerror = () => {
      currentAudio = null
      speakFallback(text, onEnd)
    }

    await audio.play()
  } catch (err) {
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
export function stopPlaying() {
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
