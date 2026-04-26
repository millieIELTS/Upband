// IELTS Listening 받아쓰기 — Band별 · 토픽별 (단어 공부와 동일한 토픽 구조)
// 각 (band, topic) 조합마다 15문장. TTS로 재생 → 받아쓰기 → 단어 단위 채점

import { band45 } from './listening-band45'
import { band6 } from './listening-band6'
import { band7plus } from './listening-band7plus'
import { topics } from './synonyms'

export const LISTENING_BANDS = [
  {
    id: '4-5',
    label: 'Band 4-5',
    description: '기초 · 일상 주제의 짧은 문장',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    borderHover: 'hover:border-emerald-400',
  },
  {
    id: '6',
    label: 'Band 6',
    description: '중급 · 의견 표현과 논리적 문장',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    borderHover: 'hover:border-blue-400',
  },
  {
    id: '7',
    label: 'Band 7+',
    description: '고급 · 학술적 표현과 복합 구조',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    borderHover: 'hover:border-purple-400',
  },
]

// 토픽 리스트 (단어 공부와 동일)
export const LISTENING_TOPICS = topics

// 데이터: { bandId: { topicId: [문장 15개] } }
export const LISTENING_SENTENCES = {
  '4-5': band45,
  '6': band6,
  '7': band7plus,
}
