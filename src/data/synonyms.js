// IELTS 동의어 데이터 — Band 수준별 · 주제별
// 밀리가 나중에 직접 수정/추가 가능

import { band56 } from './vocab-band56'
import { band67 } from './vocab-band67'
import { band7plus } from './vocab-band7plus'

export const bandLevels = [
  { id: 'band56', label: '기초 4-5점', color: 'text-band-low', bg: 'bg-orange-50' },
  { id: 'band67', label: '중급 6점', color: 'text-band-mid', bg: 'bg-amber-50' },
  { id: 'band7plus', label: '고급 7점', color: 'text-band-high', bg: 'bg-green-50' },
]

export const topics = [
  { id: 'education', name: 'Education', emoji: '📚' },
  { id: 'technology', name: 'Technology', emoji: '💻' },
  { id: 'environment', name: 'Environment', emoji: '🌿' },
  { id: 'health', name: 'Health', emoji: '🏥' },
  { id: 'society', name: 'Society', emoji: '🏘️' },
  { id: 'crime', name: 'Crime', emoji: '⚖️' },
  { id: 'work', name: 'Work', emoji: '💼' },
  { id: 'academic', name: 'Academic', emoji: '🎓' },
  { id: 'media', name: 'Media', emoji: '📱' },
  { id: 'government', name: 'Government', emoji: '🏛️' },
  { id: 'globalisation', name: 'Globalisation', emoji: '🌍' },
  { id: 'transport', name: 'Transport', emoji: '🚆' },
  { id: 'family', name: 'Family', emoji: '👨‍👩‍👧‍👦' },
]

export const synonymData = { band56, band67, band7plus }
