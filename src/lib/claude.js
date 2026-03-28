const API_URL = import.meta.env.DEV ? '/api/feedback' : '/api/feedback'

export async function getWritingFeedback({ essay, taskType }) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'writing', essay, taskType }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || '피드백 요청에 실패했습니다.')
  }
  return res.json()
}

export async function getSpeakingFeedback({ text, part, question }) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'speaking', text, part, question }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || '피드백 요청에 실패했습니다.')
  }
  return res.json()
}
