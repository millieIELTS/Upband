export async function transcribeAudio(audioBlob) {
  // Convert blob to base64
  const buffer = await audioBlob.arrayBuffer()
  const base64 = btoa(
    new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
  )

  const res = await fetch('/api/transcribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audio: base64, mimeType: audioBlob.type }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || '음성 변환에 실패했습니다.')
  }

  const data = await res.json()
  return data.text
}
