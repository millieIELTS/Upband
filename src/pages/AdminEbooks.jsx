import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Plus, Trash2, Save, Loader2, BookOpen, Eye, EyeOff, Upload, Image as ImageIcon, FileText, Pencil, X, Coins,
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
  const [form, setForm] = useState({ title: '', description: '', price: 0 })
  const [coverFile, setCoverFile] = useState(null)
  const [pdfFile, setPdfFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState('')
  // 수정 모드
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ title: '', description: '', price: 0 })
  const [editCoverFile, setEditCoverFile] = useState(null)
  const [editPdfFile, setEditPdfFile] = useState(null)

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

  async function uploadFile(file, folder) {
    const ext = file.name.split('.').pop()
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const { data, error } = await supabase.storage
      .from('ebooks')
      .upload(fileName, file, { cacheControl: '3600', upsert: false })
    if (error) throw error
    const { data: urlData } = supabase.storage.from('ebooks').getPublicUrl(fileName)
    return urlData.publicUrl
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving('new')
    setUploadProgress('')

    try {
      let cover_url = null
      let file_url = null

      if (coverFile) {
        setUploadProgress('커버 이미지 업로드 중...')
        cover_url = await uploadFile(coverFile, 'covers')
      }
      if (pdfFile) {
        setUploadProgress('파일 업로드 중...')
        file_url = await uploadFile(pdfFile, 'pdfs')
      }

      setUploadProgress('저장 중...')
      const { data, error } = await supabase
        .from('ebooks')
        .insert({
          title: form.title.trim(),
          description: form.description.trim() || null,
          price: parseInt(form.price) || 0,
          file_url,
          cover_url,
          is_published: false,
        })
        .select()
        .single()

      if (data) {
        setEbooks(prev => [data, ...prev])
        setForm({ title: '', description: '', price: 0 })
        setCoverFile(null)
        setPdfFile(null)
        setShowForm(false)
      }
      if (error) throw error
    } catch (err) {
      alert('업로드 실패: ' + (err.message || '알 수 없는 오류'))
    } finally {
      setSaving(null)
      setUploadProgress('')
    }
  }

  function startEdit(book) {
    setEditingId(book.id)
    setEditForm({ title: book.title, description: book.description || '', price: book.price || 0 })
    setEditCoverFile(null)
    setEditPdfFile(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditCoverFile(null)
    setEditPdfFile(null)
  }

  async function handleEdit(e, book) {
    e.preventDefault()
    if (!editForm.title.trim()) return
    setSaving(book.id)
    setUploadProgress('')

    try {
      const updates = {
        title: editForm.title.trim(),
        description: editForm.description.trim() || null,
        price: parseInt(editForm.price) || 0,
      }

      if (editCoverFile) {
        setUploadProgress('커버 이미지 업로드 중...')
        updates.cover_url = await uploadFile(editCoverFile, 'covers')
      }
      if (editPdfFile) {
        setUploadProgress('파일 업로드 중...')
        updates.file_url = await uploadFile(editPdfFile, 'pdfs')
      }

      setUploadProgress('저장 중...')
      const { error } = await supabase.from('ebooks').update(updates).eq('id', book.id)
      if (error) throw error

      setEbooks(prev => prev.map(e => e.id === book.id ? { ...e, ...updates } : e))
      setEditingId(null)
      setEditCoverFile(null)
      setEditPdfFile(null)
    } catch (err) {
      alert('수정 실패: ' + (err.message || '알 수 없는 오류'))
    } finally {
      setSaving(null)
      setUploadProgress('')
    }
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
          <div>
            <label className="block text-xs text-text-secondary mb-1">가격 (크레딧, 0=무료)</label>
            <input
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1">
              <ImageIcon size={12} className="inline mr-1" />
              커버 이미지
            </label>
            <label className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-border hover:border-primary cursor-pointer transition-colors">
              <Upload size={14} className="text-text-secondary" />
              <span className="text-sm text-text-secondary">
                {coverFile ? coverFile.name : '이미지 파일 선택 (JPG, PNG)'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files[0] || null)}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1">
              <FileText size={12} className="inline mr-1" />
              파일 (PDF/ZIP)
            </label>
            <label className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-border hover:border-primary cursor-pointer transition-colors">
              <Upload size={14} className="text-text-secondary" />
              <span className="text-sm text-text-secondary">
                {pdfFile ? pdfFile.name : 'PDF / ZIP 파일 선택'}
              </span>
              <input
                type="file"
                accept=".pdf,.zip,application/pdf,application/zip,application/x-zip-compressed"
                onChange={(e) => setPdfFile(e.target.files[0] || null)}
                className="hidden"
              />
            </label>
          </div>
          {uploadProgress && (
            <p className="text-xs text-primary flex items-center gap-1">
              <Loader2 size={12} className="animate-spin" /> {uploadProgress}
            </p>
          )}
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
              onClick={() => { setShowForm(false); setCoverFile(null); setPdfFile(null) }}
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
            <div key={book.id} className="bg-surface rounded-xl border border-border overflow-hidden">
              {/* 수정 모드 */}
              {editingId === book.id ? (
                <form onSubmit={(e) => handleEdit(e, book)} className="p-5 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold">전자책 수정</h3>
                    <button type="button" onClick={cancelEdit} className="p-1 text-text-secondary hover:text-error">
                      <X size={16} />
                    </button>
                  </div>
                  <div>
                    <label className="block text-xs text-text-secondary mb-1">제목 *</label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-secondary mb-1">설명</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full h-20 px-3 py-2 rounded-lg border border-border text-sm resize-y focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-secondary mb-1">가격 (크레딧, 0=무료)</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.price}
                      onChange={(e) => setEditForm(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-secondary mb-1">
                      <ImageIcon size={12} className="inline mr-1" />
                      커버 이미지 변경
                    </label>
                    <label className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-border hover:border-primary cursor-pointer transition-colors">
                      <Upload size={14} className="text-text-secondary" />
                      <span className="text-sm text-text-secondary">
                        {editCoverFile ? editCoverFile.name : (book.cover_url ? '현재 이미지 유지 (변경하려면 클릭)' : '이미지 파일 선택')}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setEditCoverFile(e.target.files[0] || null)}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs text-text-secondary mb-1">
                      <FileText size={12} className="inline mr-1" />
                      파일 (PDF/ZIP) 변경
                    </label>
                    <label className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-border hover:border-primary cursor-pointer transition-colors">
                      <Upload size={14} className="text-text-secondary" />
                      <span className="text-sm text-text-secondary">
                        {editPdfFile ? editPdfFile.name : (book.file_url ? '현재 파일 유지 (변경하려면 클릭)' : 'PDF / ZIP 파일 선택')}
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.zip,application/pdf,application/zip,application/x-zip-compressed"
                        onChange={(e) => setEditPdfFile(e.target.files[0] || null)}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {uploadProgress && (
                    <p className="text-xs text-primary flex items-center gap-1">
                      <Loader2 size={12} className="animate-spin" /> {uploadProgress}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={saving === book.id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
                    >
                      {saving === book.id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      저장
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-4 py-2 border border-border rounded-lg text-sm text-text-secondary hover:bg-gray-50 transition-colors"
                    >
                      취소
                    </button>
                  </div>
                </form>
              ) : (
                /* 보기 모드 */
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {book.cover_url ? (
                      <img src={book.cover_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <BookOpen size={18} className="text-primary" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium truncate">{book.title}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          book.is_published ? 'bg-success/10 text-success' : 'bg-gray-100 text-text-secondary'
                        }`}>
                          {book.is_published ? '공개' : '비공개'}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-xs text-accent font-medium">
                          {book.price === 0 ? '무료' : (
                            <>
                              <Coins size={12} />
                              {book.price.toLocaleString()}
                            </>
                          )}
                        </span>
                      </div>
                      {book.description && (
                        <p className="text-xs text-text-secondary truncate">{book.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => startEdit(book)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs hover:bg-gray-50 hover:border-primary hover:text-primary transition-colors"
                    >
                      <Pencil size={12} /> 수정
                    </button>
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
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
