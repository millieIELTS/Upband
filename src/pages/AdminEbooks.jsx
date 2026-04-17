import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Plus, Trash2, Save, Loader2, BookOpen, Eye, EyeOff, Upload, Image as ImageIcon, FileText, Pencil, X, Coins,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

// textarea(줄별 리스트) <-> 배열 변환 헬퍼
const linesToArray = (text) => text.split('\n').map(s => s.trim()).filter(Boolean)
const arrayToLines = (arr) => (arr || []).join('\n')

const EMPTY_FORM = {
  title: '',
  description: '',
  price: 0,
  teacher_note: '',
  recommended_for: '',
  toc: '',
  learnings: '',
}

export default function AdminEbooks() {
  const { user, profile, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [ebooks, setEbooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [coverFile, setCoverFile] = useState(null)
  const [pdfFile, setPdfFile] = useState(null)
  const [previewFiles, setPreviewFiles] = useState([])
  const [uploadProgress, setUploadProgress] = useState('')
  // 수정 모드
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState(EMPTY_FORM)
  const [editCoverFile, setEditCoverFile] = useState(null)
  const [editPdfFile, setEditPdfFile] = useState(null)
  const [editPreviewFiles, setEditPreviewFiles] = useState([])
  const [editExistingPreviews, setEditExistingPreviews] = useState([])

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
    const { error } = await supabase.storage
      .from('ebooks')
      .upload(fileName, file, { cacheControl: '3600', upsert: false })
    if (error) throw error
    const { data: urlData } = supabase.storage.from('ebooks').getPublicUrl(fileName)
    return urlData.publicUrl
  }

  async function uploadMultiple(files, folder) {
    const urls = []
    for (const file of files) {
      urls.push(await uploadFile(file, folder))
    }
    return urls
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving('new')
    setUploadProgress('')

    try {
      let cover_url = null
      let file_url = null
      let preview_urls = []

      if (coverFile) {
        setUploadProgress('커버 이미지 업로드 중...')
        cover_url = await uploadFile(coverFile, 'covers')
      }
      if (pdfFile) {
        setUploadProgress('파일 업로드 중...')
        file_url = await uploadFile(pdfFile, 'pdfs')
      }
      if (previewFiles.length > 0) {
        setUploadProgress(`미리보기 이미지 업로드 중... (${previewFiles.length}장)`)
        preview_urls = await uploadMultiple(previewFiles, 'previews')
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
          teacher_note: form.teacher_note.trim() || null,
          recommended_for: linesToArray(form.recommended_for),
          toc: linesToArray(form.toc),
          learnings: linesToArray(form.learnings),
          preview_images: preview_urls,
        })
        .select()
        .single()

      if (data) {
        setEbooks(prev => [data, ...prev])
        setForm(EMPTY_FORM)
        setCoverFile(null)
        setPdfFile(null)
        setPreviewFiles([])
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
    setEditForm({
      title: book.title,
      description: book.description || '',
      price: book.price || 0,
      teacher_note: book.teacher_note || '',
      recommended_for: arrayToLines(book.recommended_for),
      toc: arrayToLines(book.toc),
      learnings: arrayToLines(book.learnings),
    })
    setEditCoverFile(null)
    setEditPdfFile(null)
    setEditPreviewFiles([])
    setEditExistingPreviews(book.preview_images || [])
  }

  function cancelEdit() {
    setEditingId(null)
    setEditCoverFile(null)
    setEditPdfFile(null)
    setEditPreviewFiles([])
    setEditExistingPreviews([])
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
        teacher_note: editForm.teacher_note.trim() || null,
        recommended_for: linesToArray(editForm.recommended_for),
        toc: linesToArray(editForm.toc),
        learnings: linesToArray(editForm.learnings),
      }

      if (editCoverFile) {
        setUploadProgress('커버 이미지 업로드 중...')
        updates.cover_url = await uploadFile(editCoverFile, 'covers')
      }
      if (editPdfFile) {
        setUploadProgress('파일 업로드 중...')
        updates.file_url = await uploadFile(editPdfFile, 'pdfs')
      }

      let mergedPreviews = [...editExistingPreviews]
      if (editPreviewFiles.length > 0) {
        setUploadProgress(`미리보기 이미지 업로드 중... (${editPreviewFiles.length}장)`)
        const newUrls = await uploadMultiple(editPreviewFiles, 'previews')
        mergedPreviews = [...mergedPreviews, ...newUrls]
      }
      updates.preview_images = mergedPreviews

      setUploadProgress('저장 중...')
      const { error } = await supabase.from('ebooks').update(updates).eq('id', book.id)
      if (error) throw error

      setEbooks(prev => prev.map(e => e.id === book.id ? { ...e, ...updates } : e))
      cancelEdit()
    } catch (err) {
      alert('수정 실패: ' + (err.message || '알 수 없는 오류'))
    } finally {
      setSaving(null)
      setUploadProgress('')
    }
  }

  function removeExistingPreview(url) {
    setEditExistingPreviews(prev => prev.filter(u => u !== url))
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
        <form onSubmit={handleCreate} className="bg-surface rounded-xl border border-border p-5 mb-6 space-y-4">
          <h3 className="text-sm font-semibold pb-2 border-b border-border">기본 정보</h3>

          <FormField label="제목 *">
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"
              placeholder="전자책 제목"
              required
            />
          </FormField>

          <FormField label="짧은 설명 (카드에 표시)">
            <textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full h-20 px-3 py-2 rounded-lg border border-border text-sm resize-y focus:outline-none focus:border-primary"
              placeholder="리스트 카드에 노출되는 1~2줄 설명"
            />
          </FormField>

          <FormField label="가격 (크레딧, 0=무료)">
            <input
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"
            />
          </FormField>

          <FormField label={<><ImageIcon size={12} className="inline mr-1" /> 커버 이미지</>}>
            <FileInput file={coverFile} onChange={setCoverFile} accept="image/*" placeholder="이미지 파일 선택 (JPG, PNG)" />
          </FormField>

          <FormField label={<><FileText size={12} className="inline mr-1" /> 파일 (PDF/ZIP)</>}>
            <FileInput file={pdfFile} onChange={setPdfFile} accept=".pdf,.zip,application/pdf,application/zip,application/x-zip-compressed" placeholder="PDF / ZIP 파일 선택" />
          </FormField>

          <h3 className="text-sm font-semibold pt-3 pb-2 border-b border-border">상세 페이지 내용 (선택)</h3>

          <FormField label="💬 강사의 한마디" hint="자료에 대한 소개, 추천 공부법 등을 자유롭게 작성해주세요.">
            <textarea
              value={form.teacher_note}
              onChange={(e) => setForm(prev => ({ ...prev, teacher_note: e.target.value }))}
              className="w-full h-28 px-3 py-2 rounded-lg border border-border text-sm resize-y focus:outline-none focus:border-primary"
              placeholder="안녕하세요, 밀리예요 🙋‍♀️..."
            />
          </FormField>

          <FormField label="🎯 이런 분께 추천" hint="한 줄에 하나씩 입력하세요.">
            <textarea
              value={form.recommended_for}
              onChange={(e) => setForm(prev => ({ ...prev, recommended_for: e.target.value }))}
              className="w-full h-24 px-3 py-2 rounded-lg border border-border text-sm resize-y focus:outline-none focus:border-primary font-mono"
              placeholder={'Band 6.0 → 6.5 목표인 분\nCambridge 문제집 단어 정리하고 싶은 분'}
            />
          </FormField>

          <FormField label="📑 목차" hint="한 줄에 하나씩 입력하세요.">
            <textarea
              value={form.toc}
              onChange={(e) => setForm(prev => ({ ...prev, toc: e.target.value }))}
              className="w-full h-24 px-3 py-2 rounded-lg border border-border text-sm resize-y focus:outline-none focus:border-primary font-mono"
              placeholder={'Chapter 1. 빈출 어휘\nChapter 2. 주제별 테마'}
            />
          </FormField>

          <FormField label="✨ 이런 걸 배울 수 있어요" hint="한 줄에 하나씩 입력하세요.">
            <textarea
              value={form.learnings}
              onChange={(e) => setForm(prev => ({ ...prev, learnings: e.target.value }))}
              className="w-full h-24 px-3 py-2 rounded-lg border border-border text-sm resize-y focus:outline-none focus:border-primary font-mono"
              placeholder={'문맥 속 예문으로 사용법 체득\n유의어 묶음 학습'}
            />
          </FormField>

          <FormField label="👀 미리보기 이미지 (여러 장 가능)">
            <label className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-border hover:border-primary cursor-pointer transition-colors">
              <Upload size={14} className="text-text-secondary" />
              <span className="text-sm text-text-secondary">
                {previewFiles.length > 0 ? `${previewFiles.length}장 선택됨` : '미리보기 이미지 선택 (여러 장 가능)'}
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setPreviewFiles(Array.from(e.target.files || []))}
                className="hidden"
              />
            </label>
          </FormField>

          {uploadProgress && (
            <p className="text-xs text-primary flex items-center gap-1">
              <Loader2 size={12} className="animate-spin" /> {uploadProgress}
            </p>
          )}
          <div className="flex gap-2 pt-2">
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
              onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setCoverFile(null); setPdfFile(null); setPreviewFiles([]) }}
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
              {editingId === book.id ? (
                <form onSubmit={(e) => handleEdit(e, book)} className="p-5 space-y-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold">전자책 수정</h3>
                    <button type="button" onClick={cancelEdit} className="p-1 text-text-secondary hover:text-error">
                      <X size={16} />
                    </button>
                  </div>

                  <FormField label="제목 *">
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"
                      required
                    />
                  </FormField>

                  <FormField label="짧은 설명 (카드에 표시)">
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full h-20 px-3 py-2 rounded-lg border border-border text-sm resize-y focus:outline-none focus:border-primary"
                    />
                  </FormField>

                  <FormField label="가격 (크레딧, 0=무료)">
                    <input
                      type="number"
                      min="0"
                      value={editForm.price}
                      onChange={(e) => setEditForm(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary"
                    />
                  </FormField>

                  <FormField label={<><ImageIcon size={12} className="inline mr-1" /> 커버 이미지 변경</>}>
                    <FileInput
                      file={editCoverFile}
                      onChange={setEditCoverFile}
                      accept="image/*"
                      placeholder={book.cover_url ? '현재 이미지 유지 (변경하려면 클릭)' : '이미지 파일 선택'}
                    />
                  </FormField>

                  <FormField label={<><FileText size={12} className="inline mr-1" /> 파일 (PDF/ZIP) 변경</>}>
                    <FileInput
                      file={editPdfFile}
                      onChange={setEditPdfFile}
                      accept=".pdf,.zip,application/pdf,application/zip,application/x-zip-compressed"
                      placeholder={book.file_url ? '현재 파일 유지 (변경하려면 클릭)' : 'PDF / ZIP 파일 선택'}
                    />
                  </FormField>

                  <h4 className="text-xs font-semibold text-text-secondary pt-2 border-t border-border">상세 페이지 내용</h4>

                  <FormField label="💬 강사의 한마디">
                    <textarea
                      value={editForm.teacher_note}
                      onChange={(e) => setEditForm(prev => ({ ...prev, teacher_note: e.target.value }))}
                      className="w-full h-28 px-3 py-2 rounded-lg border border-border text-sm resize-y focus:outline-none focus:border-primary"
                    />
                  </FormField>

                  <FormField label="🎯 이런 분께 추천 (한 줄에 하나)">
                    <textarea
                      value={editForm.recommended_for}
                      onChange={(e) => setEditForm(prev => ({ ...prev, recommended_for: e.target.value }))}
                      className="w-full h-24 px-3 py-2 rounded-lg border border-border text-sm resize-y focus:outline-none focus:border-primary font-mono"
                    />
                  </FormField>

                  <FormField label="📑 목차 (한 줄에 하나)">
                    <textarea
                      value={editForm.toc}
                      onChange={(e) => setEditForm(prev => ({ ...prev, toc: e.target.value }))}
                      className="w-full h-24 px-3 py-2 rounded-lg border border-border text-sm resize-y focus:outline-none focus:border-primary font-mono"
                    />
                  </FormField>

                  <FormField label="✨ 이런 걸 배울 수 있어요 (한 줄에 하나)">
                    <textarea
                      value={editForm.learnings}
                      onChange={(e) => setEditForm(prev => ({ ...prev, learnings: e.target.value }))}
                      className="w-full h-24 px-3 py-2 rounded-lg border border-border text-sm resize-y focus:outline-none focus:border-primary font-mono"
                    />
                  </FormField>

                  <FormField label="👀 미리보기 이미지">
                    {editExistingPreviews.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        {editExistingPreviews.map((url) => (
                          <div key={url} className="relative group">
                            <img src={url} alt="" className="w-full aspect-[3/4] rounded-lg object-cover border border-border" />
                            <button
                              type="button"
                              onClick={() => removeExistingPreview(url)}
                              className="absolute -top-1 -right-1 w-6 h-6 bg-error text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <label className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-border hover:border-primary cursor-pointer transition-colors">
                      <Upload size={14} className="text-text-secondary" />
                      <span className="text-sm text-text-secondary">
                        {editPreviewFiles.length > 0 ? `${editPreviewFiles.length}장 추가 선택됨` : '이미지 추가 (여러 장 가능)'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => setEditPreviewFiles(Array.from(e.target.files || []))}
                        className="hidden"
                      />
                    </label>
                  </FormField>

                  {uploadProgress && (
                    <p className="text-xs text-primary flex items-center gap-1">
                      <Loader2 size={12} className="animate-spin" /> {uploadProgress}
                    </p>
                  )}
                  <div className="flex gap-2 pt-2">
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

function FormField({ label, hint, children }) {
  return (
    <div>
      <label className="block text-xs text-text-secondary mb-1">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-text-secondary mt-1">{hint}</p>}
    </div>
  )
}

function FileInput({ file, onChange, accept, placeholder }) {
  return (
    <label className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-border hover:border-primary cursor-pointer transition-colors">
      <Upload size={14} className="text-text-secondary" />
      <span className="text-sm text-text-secondary">
        {file ? file.name : placeholder}
      </span>
      <input
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files[0] || null)}
        className="hidden"
      />
    </label>
  )
}
