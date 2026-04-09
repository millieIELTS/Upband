export const config = {
  maxDuration: 15,
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { text, voice } = req.body || {}
  if (!text || text.length > 1000) {
    return res.status(400).json({ error: 'Invalid text' })
  }

  const VOICES = [
    'en-GB-SoniaNeural',
    'en-GB-ThomasNeural',
    'en-AU-WilliamNeural',
    'en-US-GuyNeural',
    'en-AU-NatashaNeural',
  ]

  const selectedVoice = voice && VOICES.includes(voice)
    ? voice
    : VOICES[Math.floor(Math.random() * VOICES.length)]

  try {
    const { MsEdgeTTS, OUTPUT_FORMAT } = await import('msedge-tts')
    const tts = new MsEdgeTTS()
    await tts.setMetadata(selectedVoice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3)
    const { audioStream } = tts.toStream(text)

    const chunks = []
    for await (const chunk of audioStream) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    if (buffer.length === 0) {
      throw new Error('Empty audio buffer')
    }

    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('X-Voice', selectedVoice)
    res.setHeader('Cache-Control', 'public, max-age=86400')
    return res.status(200).send(buffer)
  } catch (err) {
    console.error('TTS error:', err.message, err.stack)
    return res.status(500).json({ error: 'TTS generation failed', detail: err.message })
  }
}
