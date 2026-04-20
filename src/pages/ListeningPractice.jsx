import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Volume2, RotateCcw, CheckCircle2, ChevronRight, Headphones, Trophy,
} from 'lucide-react'
import { speakQuestion, stopSpeaking, pickSessionVoice } from '../lib/tts'
import { LISTENING_BANDS, LISTENING_SENTENCES } from '../data/listeningSentences'
import { useListeningProgress } from '../hooks/useListeningProgress'

// ── 영국식 ↔ 미국식 철자 동일 처리 ──────────────────────────────────────
// 받아쓰기에서 favourite/favorite 둘 다 맞는 것으로 인정
// 비교 시에는 한쪽(미국식) 형태로 정규화해서 맞춤
const SPELLING_VARIANTS = {
  // -our → -or
  favourite: 'favorite', favourites: 'favorites',
  favour: 'favor', favours: 'favors', favoured: 'favored', favouring: 'favoring', favourable: 'favorable', favourably: 'favorably',
  colour: 'color', colours: 'colors', coloured: 'colored', colouring: 'coloring', colourful: 'colorful',
  honour: 'honor', honours: 'honors', honoured: 'honored', honouring: 'honoring', honourable: 'honorable',
  labour: 'labor', labours: 'labors', laboured: 'labored', labouring: 'laboring',
  neighbour: 'neighbor', neighbours: 'neighbors', neighbourhood: 'neighborhood', neighbouring: 'neighboring',
  behaviour: 'behavior', behaviours: 'behaviors', behavioural: 'behavioral',
  flavour: 'flavor', flavours: 'flavors', flavoured: 'flavored',
  harbour: 'harbor', harbours: 'harbors',
  humour: 'humor', humours: 'humors',
  rumour: 'rumor', rumours: 'rumors',
  vapour: 'vapor', vapours: 'vapors',
  odour: 'odor', odours: 'odors',
  tumour: 'tumor', tumours: 'tumors',
  armour: 'armor',
  saviour: 'savior', saviours: 'saviors',
  endeavour: 'endeavor', endeavours: 'endeavors',
  savour: 'savor', savours: 'savors',
  parlour: 'parlor',
  // -re → -er
  centre: 'center', centres: 'centers', centred: 'centered',
  metre: 'meter', metres: 'meters',
  theatre: 'theater', theatres: 'theaters',
  litre: 'liter', litres: 'liters',
  fibre: 'fiber', fibres: 'fibers',
  // -ise/-isation → -ize/-ization
  organise: 'organize', organises: 'organizes', organised: 'organized', organising: 'organizing', organisation: 'organization', organisations: 'organizations',
  realise: 'realize', realises: 'realizes', realised: 'realized', realising: 'realizing', realisation: 'realization',
  recognise: 'recognize', recognises: 'recognizes', recognised: 'recognized', recognising: 'recognizing',
  emphasise: 'emphasize', emphasises: 'emphasizes', emphasised: 'emphasized', emphasising: 'emphasizing',
  analyse: 'analyze', analyses: 'analyzes', analysed: 'analyzed', analysing: 'analyzing',
  criticise: 'criticize', criticises: 'criticizes', criticised: 'criticized', criticising: 'criticizing',
  specialise: 'specialize', specialises: 'specializes', specialised: 'specialized', specialising: 'specializing',
  summarise: 'summarize', summarises: 'summarizes', summarised: 'summarized', summarising: 'summarizing',
  prioritise: 'prioritize', prioritises: 'prioritizes', prioritised: 'prioritized', prioritising: 'prioritizing',
  categorise: 'categorize', categorises: 'categorizes', categorised: 'categorized', categorising: 'categorizing',
  globalise: 'globalize', globalisation: 'globalization',
  commercialise: 'commercialize', commercialisation: 'commercialization',
  homogenise: 'homogenize', homogenisation: 'homogenization',
  standardise: 'standardize', standardisation: 'standardization',
  modernise: 'modernize', modernisation: 'modernization',
  memorise: 'memorize', memorised: 'memorized', memorising: 'memorizing',
  optimise: 'optimize', optimised: 'optimized', optimising: 'optimizing', optimisation: 'optimization',
  minimise: 'minimize', minimised: 'minimized', minimising: 'minimizing',
  maximise: 'maximize', maximised: 'maximized', maximising: 'maximizing',
  utilise: 'utilize', utilised: 'utilized', utilising: 'utilizing',
  visualise: 'visualize', visualised: 'visualized', visualising: 'visualizing',
  industrialise: 'industrialize', industrialised: 'industrialized',
  // -ll → -l
  travelling: 'traveling', travelled: 'traveled', traveller: 'traveler', travellers: 'travelers',
  modelling: 'modeling', modelled: 'modeled',
  cancelling: 'canceling', cancelled: 'canceled',
  labelling: 'labeling', labelled: 'labeled',
  signalling: 'signaling', signalled: 'signaled',
  // 기타
  practise: 'practice', practises: 'practices', practising: 'practicing',
  defence: 'defense', defences: 'defenses',
  offence: 'offense', offences: 'offenses',
  licence: 'license', licences: 'licenses',
  pretence: 'pretense',
  grey: 'gray', greys: 'grays',
  aluminium: 'aluminum',
  programme: 'program', programmes: 'programs',
  cheque: 'check', cheques: 'checks',
  enrol: 'enroll',
  fulfil: 'fulfill',
  skilful: 'skillful',
  wilful: 'willful',
}

// ── Word-level diff (LCS 기반) ───────────────────────────────────────────
// 구두점/대소문자 무시, 영국식/미국식 철자 둘 다 인정
function normalize(w) {
  const s = w.toLowerCase().replace(/[.,!?;:"'()\-—–]/g, '').trim()
  return SPELLING_VARIANTS[s] || s
}

function computeDiff(original, userInput) {
  const origTokens = original.split(/\s+/).filter(Boolean)
  const userTokens = (userInput || '').split(/\s+/).filter(Boolean)
  const origNorm = origTokens.map(normalize)
  const userNorm = userTokens.map(normalize)

  const m = origNorm.length
  const n = userNorm.length
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (origNorm[i - 1] === userNorm[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  const matched = new Array(m).fill(false)
  let i = m
  let j = n
  while (i > 0 && j > 0) {
    if (origNorm[i - 1] === userNorm[j - 1]) {
      matched[i - 1] = true
      i--
      j--
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--
    } else {
      j--
    }
  }

  const matchedCount = matched.filter(Boolean).length
  const accuracy = m === 0 ? 0 : Math.round((matchedCount / m) * 100)
  const tokens = origTokens.map((w, idx) => ({ word: w, matched: matched[idx] }))
  return { tokens, matchedCount, totalCount: m, accuracy }
}

export default function ListeningPractice() {
  const { bandId } = useParams()
  const navigate = useNavigate()
  const { getProgress, saveProgress, resetProgress, loaded } = useListeningProgress()

  const band = LISTENING_BANDS.find((b) => b.id === bandId)
  const sentences = LISTENING_SENTENCES[bandId] || []

  const [qIndex, setQIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [stage, setStage] = useState('dictating') // 'dictating' | 'reviewing'
  const [playing, setPlaying] = useState(false)
  const [scores, setScores] = useState([]) // 각 문장 accuracy 저장
  const [resumed, setResumed] = useState(false) // 진행도 복원 완료 여부
  const textareaRef = useRef(null)

  const currentSentence = sentences[qIndex]

  // 세션 음성 고정
  useEffect(() => {
    pickSessionVoice()
    return () => stopSpeaking()
  }, [])

  // 저장된 진행도 복원 (마운트 직후 한 번만)
  useEffect(() => {
    if (!loaded || resumed) return
    const saved = getProgress(bandId)
    if (saved > 0 && saved < sentences.length) {
      setQIndex(saved)
    }
    setResumed(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded])

  // 문장 이동 시 자동 재생 + 텍스트영역 초기화
  useEffect(() => {
    if (!currentSentence) return
    setStage('dictating')
    setUserInput('')
    const t = setTimeout(() => {
      handlePlay()
    }, 400)
    return () => {
      clearTimeout(t)
      stopSpeaking()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIndex, bandId])

  // 채점 단계에서도 dictating 끝나면 자동 포커스
  useEffect(() => {
    if (stage === 'dictating' && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [stage])

  const handlePlay = () => {
    if (!currentSentence) return
    setPlaying(true)
    speakQuestion(currentSentence, () => setPlaying(false))
  }

  const handleGrade = () => {
    const diff = computeDiff(currentSentence, userInput)
    setScores((prev) => {
      const next = [...prev]
      next[qIndex] = diff.accuracy
      return next
    })
    setStage('reviewing')
    stopSpeaking()
  }

  const handleNext = () => {
    if (qIndex + 1 < sentences.length) {
      const next = qIndex + 1
      setQIndex(next)
      saveProgress(bandId, next) // 다음 문장 위치 저장
    } else {
      saveProgress(bandId, sentences.length) // 완료 표시
      setStage('done')
    }
  }

  if (!band || sentences.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <p className="text-text-secondary mb-4">Band 정보를 찾을 수 없습니다.</p>
        <Link to="/listening" className="text-primary no-underline">난이도 선택으로</Link>
      </div>
    )
  }

  // ─────────────── 완료 화면 ───────────────
  if (stage === 'done') {
    const total = scores.length
    const avg = total > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / total) : 0
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <Trophy size={56} className="mx-auto text-amber-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">수고하셨어요!</h1>
        <p className="text-text-secondary mb-2">{band.label} · 전체 {total}문장 완료</p>
        <div className="text-5xl font-bold text-primary my-6 font-mono">{avg}%</div>
        <p className="text-sm text-text-secondary mb-8">평균 정확도</p>

        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button
            onClick={() => { resetProgress(bandId); setQIndex(0); setScores([]); setStage('dictating') }}
            className="px-5 py-2.5 rounded-lg border border-border text-sm hover:border-primary hover:text-primary transition-colors flex items-center gap-1.5 justify-center"
          >
            <RotateCcw size={14} /> 다시 풀기
          </button>
          <button
            onClick={() => navigate('/listening')}
            className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            다른 난이도로
          </button>
        </div>
      </div>
    )
  }

  const diff = stage === 'reviewing' ? computeDiff(currentSentence, userInput) : null

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* 상단 */}
      <div className="flex items-center justify-between mb-4">
        <Link to="/listening" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary no-underline">
          <ArrowLeft size={14} /> 난이도 선택
        </Link>
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${band.bg} ${band.color}`}>
          {band.label} · {qIndex + 1} / {sentences.length}
        </span>
      </div>

      {/* 진행 바 */}
      <div className="flex gap-1 mb-6">
        {sentences.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${
              i < qIndex ? 'bg-cyan-500' : i === qIndex ? 'bg-cyan-500/60' : 'bg-border'
            }`}
          />
        ))}
      </div>

      {/* 재생 카드 */}
      <div className="bg-surface rounded-xl border border-border p-6 mb-4 text-center">
        <button
          onClick={handlePlay}
          className={`inline-flex items-center justify-center w-20 h-20 rounded-full transition-all ${
            playing ? 'bg-cyan-500/20 animate-pulse' : 'bg-cyan-500 hover:bg-cyan-600 text-white'
          }`}
        >
          <Volume2 size={36} className={playing ? 'text-cyan-600' : 'text-white'} />
        </button>
        <p className="text-xs text-text-secondary mt-3">
          {playing ? '재생 중...' : stage === 'dictating' ? '🔊 눌러서 다시 듣기' : '🔊 원문 다시 듣기'}
        </p>
      </div>

      {/* Dictating 단계 */}
      {stage === 'dictating' && (
        <>
          <textarea
            ref={textareaRef}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              // Enter(without Shift)로 바로 채점
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (userInput.trim()) handleGrade()
              }
            }}
            placeholder="들은 대로 타이핑하세요... (Enter로 채점)"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="w-full h-28 p-4 rounded-xl border border-border bg-surface resize-y text-sm leading-relaxed focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
          <button
            onClick={handleGrade}
            disabled={!userInput.trim()}
            className="mt-3 w-full py-3 bg-cyan-600 text-white rounded-xl font-semibold hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            채점하기 <ChevronRight size={16} />
          </button>
        </>
      )}

      {/* Reviewing 단계 */}
      {stage === 'reviewing' && diff && (
        <>
          <div className="bg-surface rounded-xl border border-border p-5 mb-3">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-text-secondary">정답 확인</p>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span className="text-sm font-bold text-emerald-600">
                  {diff.matchedCount}/{diff.totalCount}
                </span>
                <span className="text-xs text-text-secondary">({diff.accuracy}%)</span>
              </div>
            </div>

            {/* 원문 — 맞은 단어 / 틀린 단어 시각화 */}
            <p className="text-base leading-loose">
              {diff.tokens.map((t, i) => (
                <span
                  key={i}
                  className={
                    t.matched
                      ? 'text-emerald-700 font-medium'
                      : 'text-red-600 font-semibold bg-red-50 rounded px-1 mx-0.5'
                  }
                >
                  {t.word}{i < diff.tokens.length - 1 ? ' ' : ''}
                </span>
              ))}
            </p>
          </div>

          {/* 내가 친 답안 */}
          {userInput.trim() && (
            <div className="bg-surface/50 rounded-xl border border-border/50 p-4 mb-3">
              <p className="text-xs font-medium text-text-secondary mb-1">내 답안</p>
              <p className="text-sm text-text-secondary italic">{userInput}</p>
            </div>
          )}

          <button
            onClick={handleNext}
            className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
          >
            {qIndex + 1 < sentences.length ? '다음 문장' : '완료하기'}
            <ChevronRight size={16} />
          </button>
        </>
      )}

      {/* 안내 푸터 */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-1.5 text-[11px] text-text-secondary">
          <Headphones size={11} />
          구두점·대소문자는 자동으로 무시돼요
        </div>
      </div>
    </div>
  )
}
