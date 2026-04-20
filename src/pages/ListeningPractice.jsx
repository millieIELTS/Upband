import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Volume2, RotateCcw, CheckCircle2, ChevronRight, Headphones, Trophy,
} from 'lucide-react'
import { speakQuestion, stopSpeaking, pickSessionVoice } from '../lib/tts'
import { LISTENING_BANDS, LISTENING_SENTENCES } from '../data/listeningSentences'
import { useListeningProgress } from '../hooks/useListeningProgress'
import { useStreak } from '../hooks/useStreak'

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
  const { recordActivity } = useStreak()

  const band = LISTENING_BANDS.find((b) => b.id === bandId)
  const sentences = LISTENING_SENTENCES[bandId] || []

  const [qIndex, setQIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [stage, setStage] = useState('dictating') // 'dictating' | 'reviewing' | 'done'
  const [playing, setPlaying] = useState(false)
  const [results, setResults] = useState({}) // { [origIdx]: { accuracy, userInput } }
  const [resumed, setResumed] = useState(false) // 진행도 복원 완료 여부
  // 오답 복습 모드
  const [reviewMode, setReviewMode] = useState(false)
  const [reviewList, setReviewList] = useState([]) // 복습할 원본 문장 index 배열
  const [reviewPos, setReviewPos] = useState(0)
  const textareaRef = useRef(null)

  // 현재 보여줄 문장 index (리뷰 모드면 reviewList에서 뽑음)
  const currentIdx = reviewMode ? (reviewList[reviewPos] ?? 0) : qIndex
  const currentSentence = sentences[currentIdx]
  // 세션 진행도 표시용
  const sessionTotal = reviewMode ? reviewList.length : sentences.length
  const sessionPos = reviewMode ? reviewPos : qIndex

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
  }, [currentIdx, bandId, reviewMode])

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
    setResults((prev) => ({
      ...prev,
      [currentIdx]: { accuracy: diff.accuracy, userInput },
    }))
    // 🔥 스트릭 기록 (하루 한 번만 반영되도록 훅 내부에서 처리)
    recordActivity()
    setStage('reviewing')
    stopSpeaking()
  }

  const handleNext = () => {
    if (reviewMode) {
      if (reviewPos + 1 < reviewList.length) {
        setReviewPos(reviewPos + 1)
      } else {
        setStage('done')
      }
      return
    }
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
    const origIndices = Object.keys(results).map(Number).sort((a, b) => a - b)
    const scoreArr = origIndices.map((i) => results[i].accuracy)
    const total = scoreArr.length
    const avg = total > 0 ? Math.round(scoreArr.reduce((a, b) => a + b, 0) / total) : 0
    const wrongIndices = origIndices.filter((i) => results[i].accuracy < 100)

    const startReview = () => {
      setReviewMode(true)
      setReviewList(wrongIndices)
      setReviewPos(0)
      setStage('dictating')
    }

    const restartAll = () => {
      resetProgress(bandId)
      setQIndex(0)
      setResults({})
      setReviewMode(false)
      setReviewList([])
      setReviewPos(0)
      setStage('dictating')
    }

    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <Trophy size={56} className="mx-auto text-amber-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">
          {reviewMode ? '오답 복습 완료!' : '수고하셨어요!'}
        </h1>
        <p className="text-text-secondary mb-2">
          {band.label} · {reviewMode ? `복습 ${reviewList.length}문장` : `전체 ${total}문장`}
        </p>
        <div className="text-5xl font-bold text-primary my-6 font-mono">{avg}%</div>
        <p className="text-sm text-text-secondary mb-6">평균 정확도 (전체 문장 기준)</p>

        {/* 📝 오답노트 */}
        {wrongIndices.length > 0 && (
          <div className="bg-surface rounded-2xl border border-border p-5 mb-6 text-left max-h-[420px] overflow-y-auto">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">📝</span>
              <p className="text-sm font-bold text-red-500">오답노트 ({wrongIndices.length}문장)</p>
            </div>
            <div className="space-y-3">
              {wrongIndices.map((i) => {
                const r = results[i]
                const d = computeDiff(sentences[i], r.userInput)
                return (
                  <div key={i} className="pb-3 border-b border-border last:border-0 last:pb-0">
                    <p className="text-[11px] text-text-secondary mb-1">
                      {i + 1}번 · {d.matchedCount}/{d.totalCount} ({r.accuracy}%)
                    </p>
                    <p className="text-sm leading-relaxed mb-1">
                      {d.tokens.map((t, k) => (
                        <span
                          key={k}
                          className={
                            t.matched
                              ? 'text-emerald-700'
                              : 'text-red-600 font-semibold bg-red-50 rounded px-0.5 mx-0.5'
                          }
                        >
                          {t.word}{k < d.tokens.length - 1 ? ' ' : ''}
                        </span>
                      ))}
                    </p>
                    {r.userInput && (
                      <p className="text-xs text-text-secondary italic">→ "{r.userInput}"</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {wrongIndices.length === 0 && total > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-emerald-700">🎉 모두 정답! 완벽해요.</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          {wrongIndices.length > 0 && (
            <button
              onClick={startReview}
              className="px-5 py-2.5 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors flex items-center gap-1.5 justify-center"
            >
              📝 오답만 다시 풀기 ({wrongIndices.length})
            </button>
          )}
          <button
            onClick={restartAll}
            className="px-5 py-2.5 rounded-lg border border-border text-sm hover:border-primary hover:text-primary transition-colors flex items-center gap-1.5 justify-center"
          >
            <RotateCcw size={14} /> 처음부터
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
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${reviewMode ? 'bg-red-50 text-red-600' : `${band.bg} ${band.color}`}`}>
          {band.label}{reviewMode && ' · 📝 오답복습'} · {sessionPos + 1} / {sessionTotal}
        </span>
      </div>

      {/* 진행 바 */}
      <div className="flex gap-1 mb-6">
        {Array.from({ length: sessionTotal }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${
              i < sessionPos
                ? reviewMode ? 'bg-red-400' : 'bg-cyan-500'
                : i === sessionPos
                ? reviewMode ? 'bg-red-400/60' : 'bg-cyan-500/60'
                : 'bg-border'
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
            {sessionPos + 1 < sessionTotal ? '다음 문장' : (reviewMode ? '오답 복습 완료' : '완료하기')}
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
