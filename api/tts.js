import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'

const VOICES = [
  'en-GB-SoniaNeural',   // 영국 여성
  'en-GB-ThomasNeural',  // 영국 남성
  'en-AU-WilliamNeural', // 호주 남성
  'en-US-GuyNeural',     // 미국 남성
  'en-AU-NatashaNeural', // 호주 여성
]

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { text, voice } = req.body || {}
  if (!text || text.length > 1000) {
    return res.status(400).json({ error: 'Invalid text' })
  }

  // voice 지정이 있으면 해당 음성, 없으면 랜덤
  const selectedVoice = voice && VOICES.includes(voice)
    ? voice
    : VOICES[Math.floor(Math.random() * VOICES.length)]

  try {
    const tts = new MsEdgeTTS()
    await tts.setMetadata(selectedVoice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3)
    const { audioStream } = tts.toStream(text)

    const chunks = []
    for await (const chunk of audioStream) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('X-Voice', selectedVoice)
    res.setHeader('Cache-Control', 'public, max-age=86400') // 24시간 캐시
    return res.status(200).send(buffer)
  } catch (err) {
    console.error('TTS error:', err)
    return res.status(500).json({ error: 'TTS generation failed' })
  }
}
