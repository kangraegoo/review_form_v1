'use client'

import { useEffect, useState } from 'react'
import AdminNav from '@/components/admin/AdminNav'

type Notice = {
  id: number
  type: string
  title: string
  content: string
  author: string
  is_active: boolean
  start_at: string | null
  end_at: string | null
  sort_order: number
  created_at: string
}

const TYPES = ['공지', '알림', '홍보']
const EMPTY_FORM = { type: '공지', title: '', content: '', author: '', is_active: true, start_at: '', end_at: '', sort_order: 0 }

const TYPE_BADGE: Record<string, string> = {
  '공지': 'bg-blue-600',
  '알림': 'bg-orange-500',
  '홍보': 'bg-green-600',
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/notices')
      if (res.ok) setNotices(await res.json())
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openAdd() {
    setForm(EMPTY_FORM)
    setEditId(null)
    setModal('add')
  }

  function openEdit(n: Notice) {
    setForm({
      type: n.type,
      title: n.title,
      content: n.content,
      author: n.author,
      is_active: n.is_active,
      start_at: n.start_at ? n.start_at.split('T')[0] : '',
      end_at: n.end_at ? n.end_at.split('T')[0] : '',
      sort_order: n.sort_order,
    })
    setEditId(n.id)
    setModal('edit')
  }

  async function handleSave() {
    if (!form.title.trim()) return alert('제목을 입력해주세요.')
    setSaving(true)
    try {
      if (modal === 'add') {
        await fetch('/api/admin/notices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
      } else {
        await fetch('/api/admin/notices', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editId, ...form }),
        })
      }
      setModal(null)
      load()
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(n: Notice) {
    await fetch('/api/admin/notices', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...n, is_active: !n.is_active }),
    })
    setNotices(prev => prev.map(x => x.id === n.id ? { ...x, is_active: !x.is_active } : x))
  }

  async function handleDelete(id: number) {
    if (!confirm('삭제하시겠습니까?')) return
    await fetch('/api/admin/notices', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setNotices(prev => prev.filter(x => x.id !== id))
  }

  const fmtDate = (d: string | null) => d ? d.split('T')[0] : '-'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <AdminNav />
      <div className="px-4 py-5 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">공지 관리</h1>
          <button
            onClick={openAdd}
            className="px-4 py-1.5 bg-gray-900 text-white rounded-md text-xs font-semibold hover:bg-gray-700 transition-colors"
          >
            + 공지 추가
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <p className="text-center py-12 text-sm text-gray-400">로딩 중...</p>
          ) : notices.length === 0 ? (
            <p className="text-center py-12 text-sm text-gray-400">등록된 공지가 없습니다.</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-900 text-white">
                  {['순서', '타입', '제목', '내용', '작성자', '시작일', '종료일', '노출', '관리'].map(h => (
                    <th key={h} className="px-3 py-2.5 text-center font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {notices.map(n => (
                  <tr key={n.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-3 py-2 text-center text-gray-500">{n.sort_order}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`${TYPE_BADGE[n.type] ?? 'bg-gray-600'} text-white text-[10px] font-bold px-1.5 py-0.5 rounded`}>
                        {n.type}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-medium text-gray-900 dark:text-gray-100 max-w-[160px] truncate">{n.title}</td>
                    <td className="px-3 py-2 text-gray-500 dark:text-gray-400 max-w-[200px] truncate">{n.content || '-'}</td>
                    <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{n.author || '-'}</td>
                    <td className="px-3 py-2 text-center text-gray-500">{fmtDate(n.start_at)}</td>
                    <td className="px-3 py-2 text-center text-gray-500">{fmtDate(n.end_at)}</td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => toggleActive(n)}
                        className={`w-10 h-5 rounded-full transition-colors relative ${n.is_active ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${n.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={() => openEdit(n)}
                          className="px-2 py-1 bg-gray-700 text-white text-[11px] rounded hover:bg-gray-600 transition-colors"
                        >수정</button>
                        <button
                          onClick={() => handleDelete(n.id)}
                          className="px-2 py-1 bg-red-500 text-white text-[11px] rounded hover:bg-red-600 transition-colors"
                        >삭제</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 모달 */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {modal === 'add' ? '공지 추가' : '공지 수정'}
              </h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-5 py-4 space-y-3">
              {/* 타입 */}
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">타입</label>
                <div className="flex gap-2">
                  {TYPES.map(t => (
                    <button
                      key={t}
                      onClick={() => setForm(f => ({ ...f, type: t }))}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                        form.type === t
                          ? `${TYPE_BADGE[t]} text-white`
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >{t}</button>
                  ))}
                </div>
              </div>

              {/* 제목 */}
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">제목 *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="공지 제목"
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>

              {/* 작성자 */}
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">작성자 <span className="text-gray-400">(선택)</span></label>
                <input
                  type="text"
                  value={form.author}
                  onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                  placeholder="작성자 이름"
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>

              {/* 내용 */}
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">내용 <span className="text-gray-400">(선택)</span></label>
                <textarea
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="상세 내용 (선택사항)"
                  rows={3}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-gray-700 dark:text-gray-100 resize-none"
                />
              </div>

              {/* 기간 */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">시작일 <span className="text-gray-400">(선택)</span></label>
                  <input
                    type="date"
                    value={form.start_at}
                    onChange={e => setForm(f => ({ ...f, start_at: e.target.value }))}
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">종료일 <span className="text-gray-400">(선택)</span></label>
                  <input
                    type="date"
                    value={form.end_at}
                    onChange={e => setForm(f => ({ ...f, end_at: e.target.value }))}
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
              </div>

              {/* 순서 + 노출 */}
              <div className="flex gap-3 items-end">
                <div className="w-24">
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">정렬 순서</label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
                <div className="flex items-center gap-2 pb-2">
                  <button
                    onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                    className={`w-10 h-5 rounded-full transition-colors relative ${form.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                  <span className="text-xs text-gray-600 dark:text-gray-300">즉시 노출</span>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >취소</button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50"
              >{saving ? '저장 중...' : '저장'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
