// IELTS 동의어 데이터 — Band 수준별 · 주제별
// 밀리가 나중에 직접 수정/추가 가능

import { band56 } from './vocab-band56'
import { band67 } from './vocab-band67'
import { band7plus } from './vocab-band7plus'

export const bandLevels = [
  { id: 'band56', label: 'Band 5-6', color: 'text-band-low', bg: 'bg-orange-50' },
  { id: 'band67', label: 'Band 6-7', color: 'text-band-mid', bg: 'bg-amber-50' },
  { id: 'band7plus', label: 'Band 7+', color: 'text-band-high', bg: 'bg-green-50' },
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
]

export const synonymData = { band56, band67, band7plus }
