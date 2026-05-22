'use client'

import { useRef, useState } from 'react'
import GNBHeader from '@/components/GNBHeader'

type Request = {
  id: number
  created_at: string
  platform: string
  keyword: string
  option: string
  review_cost: number
  order_number: string
  buyer: string
  recipient: string
  depositor: string
  status: string
  image1_url: string
  image2_url: string
  review_image_url: string
}

export default function ReviewPage() {
  const [depositor, setDepositor] = useState('')
  const [requests, setRequests] = useState<Request[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [reviewImage, setReviewImage] = useState<{ file: File; preview: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [doneIds, setDoneIds] = useState<Set<number>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!depositor.trim()) return
    setLoading(true)
    setSearched(false)
    setExpandedId(null)
    setReviewImage(null)
    try {
      const res = await fetch(`/api/requests?depositor=${encodeURIComponent(depositor.trim())}`)
      const data = await res.json()
      setRequests(data)
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }

  function handleExpand(id: number) {
    if (expandedId === id) {
      setExpandedId(null)
      setReviewImage(null)
    } else {
      setExpandedId(id)
      setReviewImage(null)
    }
  }

  function handleImageSelect(file: File) {
    if (reviewImage) URL.revokeObjectURL(reviewImage.preview)
    setReviewImage({ file, preview: URL.createObjectURL(file) })
  }

  async function handleReviewSubmit(requestId: number) {
    if (!reviewImage) return alert('이미지를 선택해주세요.')
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('file', reviewImage.file)
      fd.append('folder', 'review')
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd })
      const { url } = await uploadRes.json()

      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: requestId, review_image_url: url }),
      })
      if (!res.ok) throw new Error()

      setDoneIds(prev => new Set([...prev, requestId]))
      setRequests(prev =>
        prev.map(r => r.id === requestId ? { ...r, status: '리뷰완료', review_image_url: url } : r)
      )
      setExpandedId(null)
      setReviewImage(null)
    } catch {
      alert('제출 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <GNBHeader />

      <div className="max-w-2xl mx-auto p-4 pb-10">
        {/* 검색 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-4">
          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">예금주 이름으로 조회</h2>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={depositor}
              onChange={e => setDepositor(e.target.value)}
              placeholder="예금주 이름 입력"
              className="flex-1 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {loading ? '조회 중' : '조회'}
            </button>
          </form>
        </div>

        {/* 결과 */}
        {searched && (
          requests.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-10">조회된 내역이 없습니다.</div>
          ) : (
            <div className="space-y-3">
              {requests.map(req => (
                <div key={req.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                  {/* 카드 헤더 */}
                  <div className="p-4 flex items-start justify-between gap-3 dark:border-gray-700">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 text-xs font-bold rounded text-white ${
                            req.status === '리뷰완료' ? 'bg-red-600' : 'bg-gray-900'
                          }`}
                        >
                          {req.status}
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(req.created_at)}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 truncate">{req.keyword}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {req.platform} · {req.option} · {req.review_cost?.toLocaleString()}원
                      </p>
                      {req.order_number && (
                        <p className="text-xs text-gray-400 mt-0.5">주문번호: {req.order_number}</p>
                      )}
                    </div>

                    {req.status !== '리뷰완료' && !doneIds.has(req.id) && (
                      <button
                        onClick={() => handleExpand(req.id)}
                        className="shrink-0 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {expandedId === req.id ? '닫기' : '리뷰 제출'}
                      </button>
                    )}
                  </div>

                  {/* 리뷰 이미지 제출 영역 */}
                  {expandedId === req.id && (
                    <div className="border-t border-gray-100 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">리뷰 인증 이미지를 첨부해주세요.</p>
                      <div className="flex items-center gap-3 mb-3">
                        {reviewImage ? (
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                            <img src={reviewImage.preview} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => { URL.revokeObjectURL(reviewImage.preview); setReviewImage(null) }}
                              className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full text-xs flex items-center justify-center leading-none"
                            >×</button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-gray-500 transition-colors"
                          >
                            <span className="text-2xl leading-none">+</span>
                            <span className="text-xs mt-1">이미지</span>
                          </button>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => { if (e.target.files?.[0]) handleImageSelect(e.target.files[0]); e.target.value = '' }}
                        />
                      </div>
                      <button
                        onClick={() => handleReviewSubmit(req.id)}
                        disabled={submitting || !reviewImage}
                        className="w-full py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-40"
                      >
                        {submitting ? '제출 중...' : '리뷰 제출하기'}
                      </button>
                    </div>
                  )}

                  {/* 리뷰 완료 후 이미지 미리보기 */}
                  {req.status === '리뷰완료' && req.review_image_url && (
                    <div className="border-t border-gray-100 p-4 flex items-center gap-3">
                      <img
                        src={req.review_image_url}
                        alt="리뷰 이미지"
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                      />
                      <span className="text-xs text-gray-500">리뷰 이미지 제출 완료</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
