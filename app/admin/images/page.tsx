'use client'

import { useEffect, useState } from 'react'
import AdminNav from '@/components/admin/AdminNav'

type ImageItem = {
  url: string
  type: string
  field: string
  requestId: number
  depositor: string
  keyword: string
  date: string
}

type Row = {
  id: number
  created_at: string
  depositor: string
  keyword: string
  image1_url: string | null
  image2_url: string | null
  review_image_url: string | null
}

function rowsToImages(rows: Row[]): ImageItem[] {
  return rows.flatMap(r => [
    r.image1_url     ? { url: r.image1_url,      type: '구매',  field: 'image1_url',      requestId: r.id, depositor: r.depositor, keyword: r.keyword, date: r.created_at } : null,
    r.image2_url     ? { url: r.image2_url,      type: '구매2', field: 'image2_url',      requestId: r.id, depositor: r.depositor, keyword: r.keyword, date: r.created_at } : null,
    r.review_image_url ? { url: r.review_image_url, type: '리뷰',  field: 'review_image_url', requestId: r.id, depositor: r.depositor, keyword: r.keyword, date: r.created_at } : null,
  ]).filter(Boolean) as ImageItem[]
}

const fmt = (iso: string) => {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export default function ImagesPage() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [selectMode, setSelectMode] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/images')
    const rows: Row[] = await res.json()
    setImages(rowsToImages(rows))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function toggleSelect(url: string) {
    setSelectedUrls(prev => {
      const next = new Set(prev)
      next.has(url) ? next.delete(url) : next.add(url)
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedUrls.size === images.length) {
      setSelectedUrls(new Set())
    } else {
      setSelectedUrls(new Set(images.map(i => i.url)))
    }
  }

  async function handleDelete(targets: ImageItem[]) {
    if (targets.length === 0) return
    if (!confirm(`선택한 이미지 ${targets.length}장을 삭제하시겠습니까?\nVercel Blob에서도 영구 삭제됩니다.`)) return
    setDeleting(true)
    try {
      const res = await fetch('/api/images', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: targets.map(t => ({ requestId: t.requestId, field: t.field, url: t.url })) }),
      })
      if (!res.ok) throw new Error()
      const deletedUrls = new Set(targets.map(t => t.url))
      setImages(prev => prev.filter(i => !deletedUrls.has(i.url)))
      setSelectedUrls(new Set())
    } catch {
      alert('삭제 중 오류가 발생했습니다.')
    } finally {
      setDeleting(false)
    }
  }

  const selectedItems = images.filter(i => selectedUrls.has(i.url))
  const allSelected = images.length > 0 && selectedUrls.size === images.length

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">이미지 갤러리</h1>
            {!loading && <span className="text-sm text-gray-500">총 {images.length}장</span>}
          </div>
          <div className="flex items-center gap-2">
            {selectMode && (
              <>
                <button
                  onClick={toggleSelectAll}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {allSelected ? '전체 해제' : '전체 선택'}
                </button>
                <button
                  onClick={() => handleDelete(selectedItems)}
                  disabled={selectedUrls.size === 0 || deleting}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors disabled:opacity-30"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {deleting ? '삭제 중...' : `삭제${selectedUrls.size > 0 ? ` (${selectedUrls.size})` : ''}`}
                </button>
                <button
                  onClick={() => { setSelectMode(false); setSelectedUrls(new Set()) }}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
              </>
            )}
            {!selectMode && (
              <button
                onClick={() => setSelectMode(true)}
                disabled={images.length === 0}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-30"
              >
                선택 삭제
              </button>
            )}
          </div>
        </div>

        {/* 선택 현황 바 */}
        {selectMode && selectedUrls.size > 0 && (
          <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
            {selectedUrls.size}장 선택됨
          </div>
        )}

        {/* 갤러리 */}
        {loading ? (
          <div className="text-center text-gray-400 py-20 text-sm">로딩 중...</div>
        ) : images.length === 0 ? (
          <div className="text-center text-gray-400 py-20">업로드된 이미지가 없습니다.</div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {images.map((img, i) => {
              const isSelected = selectedUrls.has(img.url)
              return (
                <div
                  key={i}
                  className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    isSelected ? 'border-red-500 ring-2 ring-red-300' : 'border-transparent'
                  }`}
                  onClick={() => selectMode && toggleSelect(img.url)}
                >
                  {/* 이미지 (선택모드 아닐 때만 새탭 링크) */}
                  {selectMode ? (
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <a href={img.url} target="_blank" rel="noreferrer" className="block w-full h-full">
                      <img src={img.url} alt="" className="w-full h-full object-cover hover:opacity-80 transition-opacity" />
                    </a>
                  )}

                  {/* 오버레이 정보 */}
                  <div className={`absolute inset-0 flex flex-col items-start justify-end p-1.5 pointer-events-none transition-opacity ${selectMode ? 'opacity-100 bg-black/20' : 'opacity-0 hover:opacity-100 bg-black/30'}`}>
                    <span className={`text-white text-xs font-bold px-1.5 py-0.5 rounded mb-0.5 ${img.type === '리뷰' ? 'bg-red-600' : 'bg-gray-700'}`}>
                      {img.type}
                    </span>
                    <span className="text-white text-xs truncate w-full">{img.depositor}</span>
                    <span className="text-gray-300 text-xs">{fmt(img.date)}</span>
                  </div>

                  {/* 체크 표시 */}
                  {selectMode && (
                    <div className={`absolute top-1.5 right-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-red-500 border-red-500' : 'bg-white/70 border-gray-400'
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  )}

                  {/* 개별 삭제 버튼 (선택 모드 아닐 때 hover 시) */}
                  {!selectMode && (
                    <button
                      onClick={e => { e.preventDefault(); e.stopPropagation(); handleDelete([img]) }}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      ×
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
