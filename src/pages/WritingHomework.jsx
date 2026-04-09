import { useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Send, Loader2, ArrowLeft, Lock, Upload, ImagePlus, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { getWritingFeedback } from '../lib/claude'
import { saveWritingSubmission } from '../lib/submissions'
import { supabase } from '../lib/supabase'
import FeedbackDisplay from '../components/writing/FeedbackDisplay'

const MAX_IMAGE_SIZE = 2 * 1024 * 1024 // 2MB

const taskInfo = {
  task1: {
    title: 'Task 1 제출',
    description: 'Task 1 문제에 대한 리포트를 제출하세요.',
    placeholder: 'Task 1 에세이를 입력하세요...',
    questionPlaceholder: 'Cambridge IELTS 몇 권의 몇 번인지 써주시거나, 없으신 경우 비워두셔도 됩니다. (비워두시면 수치는 정확히 볼 수 없지만 맞다고 생각하고 글만 평가하게 됩니다.)',
    minWords: 150,
  },
  task2: {
    title: 'Task 2 제출',
    description: 'Task 2 문제에 대한 에세이를 제출하세요.',
    placeholder: 'Task 2 에세이를 입력하세요...',
    questionPlaceholder: '문제를 여기에 적어주세요.',
    minWords: 250,
  },
}

export default function WritingHomework() {
  const { taskType } = useParams()
  const info = taskInfo[taskType] || taskInfo.task2
  const [question, setQuestion] = useState('')
  const [essay, setEssay] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [error, setError] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef(null)
  const { user, hasCredits, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const handleImageFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다. (JPG, PNG, WEBP 등)')
      return
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError(`이미지 크기는 2MB 이하만 가능합니다. (현재: ${(file.size / 1024 / 1024).toFixed(1)}MB)`)
      return
    }
    setError('')
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    handleImageFile(file)
  }

  const removeImage = () => {
    setImage(null)
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(null)
  }

  const wordCount = essay.split(/\s+/).filter(Boolean).length

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!essay.trim()) return

    if (!user) {
      navigate('/login')
      return
    }

    if (!hasCredits) {
      setError('크레딧이 부족합니다. 크레딧을 충전해주세요.')
      return
    }

    if (taskType === 'task2' && !question.trim()) {
      setError('문제를 입력해주세요.')
      return
    }

    setLoading(true)
    setFeedback(null)
    setError('')

    try {
      // 이미지 업로드
      let questionImageUrl = null
      if (image) {
        const ext = image.name.split('.').pop()
        const path = `questions/${user.id}/${Date.now()}.${ext}`
        const { error: uploadErr } = await supabase.storage
          .from('homework-images')
          .upload(path, image)
        if (uploadErr) throw new Error('이미지 업로드 실패: ' + uploadErr.message)
        const { data: urlData } = supabase.storage
          .from('homework-images')
          .getPublicUrl(path)
        questionImageUrl = urlData.publicUrl
      }

      // DB에 저장
      await saveWritingSubmission(user.id, {
        taskType,
        essay,
        question: question.trim(),
        questionImageUrl,
        isHomework: true,
        feedback: { overall_band: null, scores: { task_achievement: null, coherence_cohesion: null, lexical_resource: null, grammatical_range: null } },
      })
      await supabase.rpc('deduct_credit')
      refreshProfile()
      setFeedback({ submitted: true })
    } catch (err) {
      setError(err.message || '제출에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Link
        to="/writing"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-4 no-underline"
      >
        <ArrowLeft size={14} /> Writing 선택으로 돌아가기
      </Link>

      <div className="flex items-center gap-2 mb-1">
        <Upload size={22} className="text-accent" />
        <h1 className="text-2xl font-bold">{info.title}</h1>
      </div>
      <p className="text-text-secondary text-sm mb-6">{info.description}</p>

      {/* 문제 입력 */}
      <div className="bg-surface rounded-xl border border-border p-5 mb-4">
        <h3 className="font-semibold text-sm mb-3">문제 (Question)</h3>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={info.questionPlaceholder}
          className="w-full h-28 p-3 rounded-lg border border-border bg-white resize-y text-sm leading-relaxed focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />

        {/* Task 1 이미지 업로드 */}
        {taskType === 'task1' && (
          <div className="mt-3">
            {!imagePreview ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  dragging
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <ImagePlus size={24} className="text-text-secondary mx-auto mb-2" />
                <p className="text-sm text-text-secondary">
                  그래프/차트 이미지를 드래그하거나 클릭하여 업로드
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  이미지 파일만 가능 (JPG, PNG, WEBP) · 최대 2MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageFile(e.target.files[0])}
                />
              </div>
            ) : (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="문제 이미지"
                  className="max-h-48 rounded-lg border border-border"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-error text-white rounded-full flex items-center justify-center hover:bg-error/80 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={essay}
          onChange={(e) => setEssay(e.target.value)}
          placeholder={info.placeholder}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="w-full h-72 p-4 rounded-xl border border-border bg-surface resize-y text-sm leading-relaxed focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />

        <div className="flex items-center justify-between">
          <span className={`text-xs ${wordCount >= info.minWords ? 'text-success' : 'text-text-secondary'}`}>
            {wordCount > 0 ? `${wordCount} / ${info.minWords}+ words` : ''}
          </span>
          <div className="flex items-center gap-3">
            {!user && (
              <span className="text-xs text-text-secondary flex items-center gap-1">
                <Lock size={12} /> 로그인 필요
              </span>
            )}
            <button
              type="submit"
              disabled={loading || !essay.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-accent text-white rounded-lg font-medium text-sm hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {loading ? '제출 중...' : '제출하기'}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-error/10 text-error text-sm">{error}</div>
      )}

      {feedback?.submitted && (
        <div className="mt-4 p-4 rounded-lg bg-success/10 text-success text-sm font-medium">
          성공적으로 제출되었습니다! 선생님이 대시보드에서 확인할 수 있습니다.
        </div>
      )}
    </div>
  )
}
