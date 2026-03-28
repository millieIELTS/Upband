// Cambridge IELTS examiner style - British English female voice
let cachedVoice = null

function getBritishVoice() {
  if (cachedVoice) return cachedVoice
  const voices = speechSynthesis.getVoices()

  // Priority order: prefer British English voices
  const preferred = [
    'Google UK English Female',
    'Karen',              // macOS British
    'Daniel',             // macOS British male
    'Samantha',           // macOS fallback
    'Google UK English Male',
    'Microsoft Hazel',    // Windows British
    'Microsoft Susan',    // Windows British
  ]

  for (const name of preferred) {
    const v = voices.find((v) => v.name === name)
    if (v) { cachedVoice = v; return v }
  }

  // Fallback: any en-GB voice
  const enGB = voices.find((v) => v.lang === 'en-GB')
  if (enGB) { cachedVoice = enGB; return enGB }

  // Final fallback: any English voice
  const en = voices.find((v) => v.lang.startsWith('en'))
  if (en) { cachedVoice = en; return en }

  return null
}

// Preload voices (they load async on some browsers)
if (typeof speechSynthesis !== 'undefined') {
  speechSynthesis.getVoices()
  speechSynthesis.onvoiceschanged = () => {
    cachedVoice = null
    getBritishVoice()
  }
}

export function speakQuestion(text, onEnd) {
  speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)

  const voice = getBritishVoice()
  if (voice) utterance.voice = voice

  utterance.lang = 'en-GB'
  utterance.rate = 0.88       // slightly slower, examiner pace
  utterance.pitch = 1.0
  utterance.volume = 1.0

  if (onEnd) utterance.onend = onEnd
  speechSynthesis.speak(utterance)
}
