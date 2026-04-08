import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Plus, Trash2, Save, Loader2, BookOpen, Eye, EyeOff,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export default function AdminEbooks() {
  const { user, profile, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [ebooks, setEbooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', price: 0, file_url: '', cover_url: '' })

  const isAdmin = profile?.role === 'admin'

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) return
    loadEbooks()
  }, [user, authLoading, isAdmin])

  useEffect(() => {
    if (!authLoading && !user) navigate('/login')
  }, [authLoading, user, navigate])

  async function loadEbooks() {
    const { data } = await supabase
      .from('ebooks')
      .select('*')
      .order('created_at', { ascending: false })
    setEbooks(data || [])
    setLoading(false)
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving('new')

    const { data, error } = await supabase
      .from('ebooks')
      .insert({
        title: form.title.trim(),
        description: form.description.trim() || null,
        price: parseInt(form.price) || 0,
        file_url: form.file_url.trim() || null,
        cover_url: form.cover_url.trim() || null,
        is_published: false,
      })
      .select()
      .single()

    if (data) {
      setEbooks(prev => [data, ...prev])
      setForm({ title: '', description: '', price: 0, file_url: '', cover_url: '' })
      setShowForm(false)
    }
    setSaving(null)
  }

  async function togglePublish(id, current) {
    setSaving(id)
    await supabase.from('ebooks').update({ is_published: !current }).eq('id', id)
    setEbooks(prev => prev.map(e => e.id === id ? { ...e, is_published: !current } : e))
    setSaving(null)
  }

  async function deleteEbook(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return
    await supabase.from('ebooks').delete().eq('id', id)
    setEbooks(prev => prev.filter(e => e.id !== id))
  }

  if (authLoading || loading) {
    return <div className="text-center py-16 text-text-secondary">불러오는 중...</div>
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-16">
        <BookOpen size={48} className="text-text-secondary mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">전자책 관리</h1>
        <p className="text-text-secondary">관리자 권한이 필요합니다.</p>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={() => navigate('/dashboard')}
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-4"
      >
        <ArrowLeft size={14} /> 대시보드로 돌아가기
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">전자책 관리</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          <Plus size={14} /> 새 전자책 등록
        </button>
      </div>

      {/* 등록 폼 */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-surface rounded-xl border border-border p-5 mb-6 space-y-3">
          <div>
            <label className="block text-xs text-text-secondary mb-1">제목 *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"
              placeholder="전자책 제목"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1">설명</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full h-20 px-3 py-2 rounded-lg border border-border text-sm resize-y focus:outline-none focus:border-primary"
              placeholder="전자책 설명"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text-secondary mb-1">가격 (원, 0=무료)</label>
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">커버 이미지 URL</label>
              <input
                type="url"
                value={form.cover_url}
                onChange={(e) => setForm(prev => ({ ...prev, cover_url: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"
                placeholder="https://..."
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1">PDF 파일 URL (다운로드/구매 링크)</label>
            <input
              type="url"
              value={form.file_url}
              onChange={(e) => setForm(prev => ({ ...prev, file_url: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"
              placeholder="https://... 또는 Supabase Storage URL"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving === 'new'}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
            >
              {saving === 'new' ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              등록
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-border rounded-lg text-sm text-text-secondary hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
          </div>
        </form>
      )}

      {/* 전자책 목록 */}
      {ebooks.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-xl border border-border">
          <BookOpen size={40} className="text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary">등록된 전자책이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {ebooks.map((book) => (
            <div key={book.id} className="bg-surface rounded-xl border border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen size={18} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{book.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      book.is_published ? 'bg-success/10 text-success' : 'bg-gray-100 text-text-secondary'
                    }`}>
                      {book.is_published ? '공개' : '비공개'}
                    </span>
                    <span className="text-xs text-accent font-medium">
                      {book.price === 0 ? '무료' : `₩${book.price.toLocaleString()}`}
                    </span>
                  </div>
                  {book.description && (
                    <p className="text-xs text-text-secondary truncate">{book.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => togglePublish(book.id, book.is_published)}
                  disabled={saving === book.id}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs hover:bg-gray-50 transition-colors"
                >
                  {book.is_published ? <EyeOff size={12} /> : <Eye size={12} />}
                  {book.is_published ? '숨기기' : '공개'}
                </button>
                <button
                  onClick={() => deleteEbook(book.id)}
                  className="p-1.5 rounded-lg text-text-secondary hover:text-error hover:bg-error/5 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-bg rounded-xl text-xs text-text-secondary space-y-1">
        <p><b>사용 방법:</b></p>
        <p>1. "새 전자책 등록" 클릭 → 제목, 설명, 가격 입력</p>
        <p>2. PDF를 Supabase Storage나 Google Drive에 업로드 후 URL 붙여넣기</p>
        <p>3. "공개" 버튼으로 학생에게 노출</p>
      </div>
    </div>
  )
}
