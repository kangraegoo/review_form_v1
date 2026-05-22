'use client'

import { useEffect, useState } from 'react'
import AdminNav from '@/components/admin/AdminNav'

type Keyword = {
  id: number
  requester: string
  platform: string
  keyword: string
  option: string
  product_price: number
  review_cost: number
  review_type: string
}

const EMPTY = { requester: '', platform: '', keyword: '', option: '', product_price: 0, review_cost: 0, review_type: '' }

export default function KeywordsPage() {
  const [rows, setRows] = useState<Keyword[]>([])
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    const res = await fetch('/api/keywords')
    setRows(await res.json())
  }

  useEffect(() => { load() }, [])

  function startEdit(row: Keyword) {
    setEditId(row.id)
    setForm({ requester: row.requester, platform: row.platform, keyword: row.keyword, option: row.option, product_price: row.product_price, review_cost: row.review_cost, review_type: row.review_type })
  }

  function cancelEdit() {
    setEditId(null)
    setForm(EMPTY)
  }

  async function handleSave() {
    if (!form.platform || !form.keyword || !form.option) return alert('구매처, 키워드, 옵션은 필수입니다.')
    setSaving(true)
    try {
      if (editId) {
        await fetch('/api/keywords', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editId, ...form }),
        })
      } else {
        await fetch('/api/keywords', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
      }
      setEditId(null)
      setForm(EMPTY)
      await load()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('삭제하시겠습니까?')) return
    await fetch('/api/keywords', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await load()
  }

  const platforms = [...new Set(rows.map(r => r.platform))]
  const requesters = [...new Set(rows.map(r => r.requester).filter(Boolean))]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <AdminNav />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-5">키워드 설정</h1>

        {/* 추가/수정 폼 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-5">
          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">
            {editId ? '항목 수정' : '새 항목 추가'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">요청자</label>
              <input
                value={form.requester}
                onChange={e => setForm(p => ({ ...p, requester: e.target.value }))}
                placeholder="예: 홍길동"
                list="requester-list"
                className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
              />
              <datalist id="requester-list">
                {requesters.map(r => <option key={r} value={r} />)}
              </datalist>
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">구매처 *</label>
              <input
                value={form.platform}
                onChange={e => setForm(p => ({ ...p, platform: e.target.value }))}
                placeholder="예: 쿠팡"
                list="platform-list"
                className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
              />
              <datalist id="platform-list">
                {platforms.map(p => <option key={p} value={p} />)}
              </datalist>
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">키워드 *</label>
              <input
                value={form.keyword}
                onChange={e => setForm(p => ({ ...p, keyword: e.target.value }))}
                placeholder="키워드 입력"
                className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">구매옵션 *</label>
              <input
                value={form.option}
                onChange={e => setForm(p => ({ ...p, option: e.target.value }))}
                placeholder="옵션 입력"
                className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">상품가 (원)</label>
              <input
                type="number"
                value={form.product_price}
                onChange={e => setForm(p => ({ ...p, product_price: Number(e.target.value) }))}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">리뷰비용 (원)</label>
              <input
                type="number"
                value={form.review_cost}
                onChange={e => setForm(p => ({ ...p, review_cost: Number(e.target.value) }))}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">리뷰타입</label>
              <input
                value={form.review_type}
                onChange={e => setForm(p => ({ ...p, review_type: e.target.value }))}
                placeholder="예: 텍스트, 포토"
                className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {saving ? '저장 중...' : editId ? '수정 저장' : '추가'}
            </button>
            {editId && (
              <button
                onClick={cancelEdit}
                className="px-5 py-2 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                취소
              </button>
            )}
          </div>
        </div>

        {/* 목록 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">총 {rows.length}개</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">요청자</th>
                  <th className="text-left px-4 py-2 font-medium">구매처</th>
                  <th className="text-left px-4 py-2 font-medium">키워드</th>
                  <th className="text-left px-4 py-2 font-medium">구매옵션</th>
                  <th className="text-right px-4 py-2 font-medium">상품가</th>
                  <th className="text-right px-4 py-2 font-medium">리뷰비용</th>
                  <th className="text-center px-4 py-2 font-medium">리뷰타입</th>
                  <th className="text-center px-4 py-2 font-medium">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-gray-400 dark:text-gray-500 py-8">
                      등록된 키워드가 없습니다.
                    </td>
                  </tr>
                ) : rows.map(r => (
                  <tr key={r.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${editId === r.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{r.requester || '-'}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{r.platform}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{r.keyword}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{r.option}</td>
                    <td className="px-4 py-3 text-right text-gray-800 dark:text-gray-200">{(r.product_price ?? 0).toLocaleString()}원</td>
                    <td className="px-4 py-3 text-right text-gray-800 dark:text-gray-200">{r.review_cost.toLocaleString()}원</td>
                    <td className="px-4 py-3 text-center">
                      {r.review_type && (
                        <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded">
                          {r.review_type}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => startEdit(r)}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="text-xs text-red-500 hover:underline font-medium"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
