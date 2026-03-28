export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // For now, use a simple proxy to OpenAI Whisper API
  // In production, consider Supabase Edge Functions or a dedicated STT service
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'STT service not configured. Set OPENAI_API_KEY.' });
  }

  try {
    // Forward the audio data to OpenAI Whisper
    const formData = new FormData();

    // req.body should contain base64 audio
    const { audio, mimeType } = req.body;
    const buffer = Buffer.from(audio, 'base64');
    const blob = new Blob([buffer], { type: mimeType || 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Whisper API error:', error);
      return res.status(500).json({ error: '음성 변환에 실패했습니다.' });
    }

    const data = await response.json();
    return res.status(200).json({ text: data.text });
  } catch (error) {
    console.error('Transcribe error:', error);
    return res.status(500).json({ error: '음성 변환 중 오류가 발생했습니다.' });
  }
}
