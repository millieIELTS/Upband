import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Send, Loader2, ImagePlus, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const categoryNames = { qna: 'Q&A', reviews: '후기' }

export default function CommunityWrite() {
  const { categoryId, postId } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const isEdit = Boolean(postId)
  const fileInputRef = useRef(null)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [existingImageUrl, setExistingImageUrl] = useState(null)
  const [removeExistingImage, setRemoveExistingImage] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingPost, setLoadingPost] = useState(isEdit)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isEdit) {
      loadPost()
    }
  }, [postId])

  const loadPost = async () => {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .eq('id', postId)
      .single()

    if (error || !data) {
      setError('글을 찾을 수 없습니다.')
    } else {
      setTitle(data.title)
      setContent(data.content)
      if (data.image_url) setExistingImageUrl(data.image_url)
    }
    setLoadingPost(false)
  }

  const handleImageFile = (file) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('이미지 크기는 5MB 이하만 가능합니다.')
      return
    }
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
    setRemoveExistingImage(true)
  }

  const clearImage = () => {
    setImage(null)
    setImagePreview(null)
    if (existingImageUrl) setRemoveExistingImage(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setLoading(true)
    setError('')

    try {
      // 이미지 업로드
      let imageUrl = removeExistingImage ? null : existingImageUrl
      if (image) {
        const ext = image.name.split('.').pop()
        const path = `posts/${user.id}/${Date.now()}.${ext}`
        const { error: uploadErr } = await supabase.storage
          .from('community-images')
          .upload(path, image)
        if (uploadErr) throw new Error('이미지 업로드 실패: ' + uploadErr.message)
        const { data: urlData } = supabase.storage
          .from('community-images')
          .getPublicUrl(path)
        imageUrl = urlData.publicUrl
      }

      if (isEdit) {
        const { error } = await supabase
          .from('community_posts')
          .update({
            title: title.trim(),
            content: content.trim(),
            image_url: imageUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', postId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('community_posts')
          .insert({
            user_id: user.id,
            category: categoryId,
            title: title.trim(),
            content: content.trim(),
            image_url: imageUrl,
            author_name: profile?.display_name || '익명',
          })
        if (error) throw error
      }
      navigate(`/community/${categoryId}`)
    } catch (err) {
      setError(err.message || '저장에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    navigate('/login')
    return null
  }

  if (loadingPost) {
    return <div className="max-w-2xl mx-auto py-20 text-center text-text-secondary text-sm">불러오는 중...</div>
  }

  const showPreview = imagePreview || (existingImageUrl && !removeExistingImage)
  const previewSrc = imagePreview || existingImageUrl

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Link
        to={`/community/${categoryId}`}
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-6 no-underline"
      >
        <ArrowLeft size={16} /> {categoryNames[categoryId] || '목록'}으로
      </Link>

      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? '글 수정' : '글쓰기'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
            className="w-full h-64 px-4 py-3 rounded-xl border border-border bg-surface resize-y text-sm leading-relaxed focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* 이미지 업로드 */}
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">이미지 (선택)</label>
          {!showPreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <ImagePlus size={24} className="text-text-secondary mx-auto mb-2" />
              <p className="text-sm text-text-secondary">클릭하여 이미지 업로드</p>
              <p className="text-xs text-text-secondary mt-1">JPG, PNG, WEBP · 최대 5MB</p>
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
                src={previewSrc}
                alt="미리보기"
                className="max-h-48 rounded-xl border border-border"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-error text-white rounded-full flex items-center justify-center hover:bg-error/80 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-error/10 text-error text-sm">{error}</div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !title.trim() || !content.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {loading ? '저장 중...' : isEdit ? '수정 완료' : '등록하기'}
          </button>
        </div>
      </form>
    </div>
  )
}
