'use client'

import { useCallback, useEffect, useState } from 'react'
import AdminNav from '@/components/admin/AdminNav'

type Request = {
  id: number
  created_at: string
  requester: string
  platform: string
  keyword: string
  option: string
  product_price: number
  review_cost: number
  order_number: string
  buyer: string
  recipient: string
  phone: string
  address: string
  bank: string
  account: string
  depositor: string
  review_type: string
  image1_url: string
  image2_url: string
  status: string
  review_image_url: string
}

const today = () => new Date().toISOString().split('T')[0]
const EMPTY_FILTER = { search: '', status: '', platform: '', keyword: '', date_from: today(), date_to: today() }
const PAGE_SIZE = 30

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState(EMPTY_FILTER)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [platforms, setPlatforms] = useState<string[]>([])
  const [keywords, setKeywords] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async (f: typeof EMPTY_FILTER) => {
    setLoading(true)
    const params = new URLSearchParams({ all: '1' })
    if (f.status)    params.set('status',    f.status)
    if (f.search)    params.set('search',    f.search)
    if (f.platform)  params.set('platform',  f.platform)
    if (f.keyword)   params.set('keyword',   f.keyword)
    if (f.date_from) params.set('date_from', f.date_from)
    if (f.date_to)   params.set('date_to',   f.date_to)
    const res = await fetch(`/api/requests?${params}`)
    setRequests(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => {
    load(EMPTY_FILTER)
    fetch('/api/keywords').then(r => r.json()).then((rows: { platform: string; keyword: string }[]) => {
      setPlatforms([...new Set(rows.map(r => r.platform))])
      setKeywords([...new Set(rows.map(r => r.keyword))])
    })
  }, [load])

  const set = (key: keyof typeof EMPTY_FILTER, value: string) =>
    setFilter(prev => ({ ...prev, [key]: value, ...(key === 'platform' ? { keyword: '' } : {}) }))

  const handleSearch = () => { setExpandedId(null); setPage(1); setSelectedIds(new Set()); load(filter) }
  const handleReset  = () => { setFilter(EMPTY_FILTER); setExpandedId(null); setPage(1); setSelectedIds(new Set()); load(EMPTY_FILTER) }

  function toggleSelect(id: number) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    const pagedIds = paged.map(r => r.id)
    const allSelected = pagedIds.every(id => selectedIds.has(id))
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (allSelected) pagedIds.forEach(id => next.delete(id))
      else pagedIds.forEach(id => next.add(id))
      return next
    })
  }

  async function handleDelete() {
    if (selectedIds.size === 0) return
    if (!confirm(`선택한 ${selectedIds.size}건을 삭제하시겠습니까?`)) return
    setDeleting(true)
    try {
      const res = await fetch('/api/requests', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [...selectedIds] }),
      })
      if (!res.ok) throw new Error()
      setRequests(prev => prev.filter(r => !selectedIds.has(r.id)))
      setSelectedIds(new Set())
    } catch {
      alert('삭제 중 오류가 발생했습니다.')
    } finally {
      setDeleting(false)
    }
  }

  async function changeStatus(id: number, status: string) {
    await fetch('/api/requests', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
  }

  const fmt = (iso: string) => {
    const d = new Date(iso)
    return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  }

  function downloadExcel() {
    const params = new URLSearchParams()
    if (filter.status)    params.set('status',    filter.status)
    if (filter.search)    params.set('search',    filter.search)
    if (filter.platform)  params.set('platform',  filter.platform)
    if (filter.keyword)   params.set('keyword',   filter.keyword)
    if (filter.date_from) params.set('date_from', filter.date_from)
    if (filter.date_to)   params.set('date_to',   filter.date_to)
    window.location.href = `/api/export?${params}`
  }

  const pending    = requests.filter(r => r.status === '대기중').length
  const done       = requests.filter(r => r.status === '리뷰완료').length
  const totalPages = Math.max(1, Math.ceil(requests.length / PAGE_SIZE))
  const paged      = requests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const thClass = "px-2.5 py-2 text-center font-semibold text-[11px] tracking-wide border-r border-gray-700 last:border-0"
  const tdClass = "px-2.5 py-1.5 text-center"

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <AdminNav />
      <div className="px-4 py-5">
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">구매신청 목록</h1>

        {/* 필터 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 mb-3">
          <div className="flex flex-wrap gap-2 mb-2">
            <div className="flex flex-col gap-0.5">
              <label className="text-[11px] text-gray-400 dark:text-gray-500">통합검색</label>
              <input
                type="text"
                value={filter.search}
                onChange={e => set('search', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="예금주 / 주문번호 / 구매자"
                className="border border-gray-200 dark:border-gray-600 rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 w-52"
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-[11px] text-gray-400 dark:text-gray-500">상태</label>
              <select value={filter.status} onChange={e => set('status', e.target.value)}
                className="border border-gray-200 dark:border-gray-600 rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-gray-700 dark:text-gray-100 w-28">
                <option value="">전체</option>
                <option value="대기중">대기중</option>
                <option value="리뷰완료">리뷰완료</option>
              </select>
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-[11px] text-gray-400 dark:text-gray-500">구매처</label>
              <select value={filter.platform} onChange={e => set('platform', e.target.value)}
                className="border border-gray-200 dark:border-gray-600 rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-gray-700 dark:text-gray-100 w-28">
                <option value="">전체</option>
                {platforms.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-[11px] text-gray-400 dark:text-gray-500">키워드</label>
              <select value={filter.keyword} onChange={e => set('keyword', e.target.value)}
                className="border border-gray-200 dark:border-gray-600 rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-gray-700 dark:text-gray-100 w-36">
                <option value="">전체</option>
                {keywords.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-[11px] text-gray-400 dark:text-gray-500">시작일</label>
              <input type="date" value={filter.date_from} onChange={e => set('date_from', e.target.value)}
                className="border border-gray-200 dark:border-gray-600 rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-gray-700 dark:text-gray-100" />
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-[11px] text-gray-400 dark:text-gray-500">종료일</label>
              <input type="date" value={filter.date_to} onChange={e => set('date_to', e.target.value)}
                className="border border-gray-200 dark:border-gray-600 rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-gray-700 dark:text-gray-100" />
            </div>
            <div className="flex items-end gap-1.5">
              <button onClick={handleSearch}
                className="px-4 py-1.5 bg-gray-900 text-white rounded-md text-xs font-semibold hover:bg-gray-700 transition-colors">
                조회
              </button>
              <button onClick={handleReset}
                className="px-3 py-1.5 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-md text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                초기화
              </button>
            </div>
          </div>
        </div>

        {/* 요약 + 엑셀 다운로드 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">총 <b className="text-gray-900 dark:text-gray-100">{requests.length}</b>건</span>
            <span className="px-1.5 py-0.5 bg-gray-800 text-white text-[11px] font-bold rounded">대기중 {pending}</span>
            <span className="px-1.5 py-0.5 bg-red-600 text-white text-[11px] font-bold rounded">리뷰완료 {done}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              disabled={selectedIds.size === 0 || deleting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-md text-xs font-semibold hover:bg-red-700 transition-colors disabled:opacity-30"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {deleting ? '삭제 중...' : `삭제${selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}`}
            </button>
            <button
              onClick={downloadExcel}
              disabled={requests.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-md text-xs font-semibold hover:bg-green-700 transition-colors disabled:opacity-40"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              엑셀 다운로드
            </button>
          </div>
        </div>

        {/* 테이블 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs whitespace-nowrap border-collapse">
              <thead>
                <tr className="bg-gray-900 text-white">
                  <th className={thClass}>
                    <input
                      type="checkbox"
                      checked={paged.length > 0 && paged.every(r => selectedIds.has(r.id))}
                      onChange={toggleSelectAll}
                      className="w-3.5 h-3.5 accent-white cursor-pointer"
                    />
                  </th>
                  {['제출일시','상태','요청자','구매처','키워드','구매옵션','상품가','리뷰비용','주문번호','구매자','수취인','전화번호','주소','은행명','계좌번호','예금주','리뷰타입','상태변경','이미지'].map(h => (
                    <th key={h} className={thClass}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={20} className="text-center py-10 text-gray-400 dark:text-gray-500 text-sm">로딩 중...</td></tr>
                ) : requests.length === 0 ? (
                  <tr><td colSpan={20} className="text-center py-10 text-gray-400 dark:text-gray-500 text-sm">결과가 없습니다.</td></tr>
                ) : paged.map((r) => (
                  <>
                    <tr
                      key={r.id}
                      onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                      className={`cursor-pointer border-b border-gray-100 dark:border-gray-700 transition-colors ${
                        selectedIds.has(r.id) ? 'bg-red-50 dark:bg-red-900/20' : expandedId === r.id ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {/* 체크박스 */}
                      <td className={tdClass} onClick={e => { e.stopPropagation(); toggleSelect(r.id) }}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(r.id)}
                          onChange={() => toggleSelect(r.id)}
                          className="w-3.5 h-3.5 accent-gray-900 cursor-pointer"
                        />
                      </td>
                      {/* 제출일시 */}
                      <td className={`${tdClass} text-gray-500 text-[11px]`}>{fmt(r.created_at)}</td>
                      {/* 상태 */}
                      <td className={tdClass}>
                        <span className={`inline-block px-1.5 py-0.5 text-[11px] font-bold rounded text-white ${r.status === '리뷰완료' ? 'bg-red-500' : 'bg-gray-700'}`}>
                          {r.status}
                        </span>
                      </td>
                      {/* 요청자 */}
                      <td className={`${tdClass} text-gray-700 font-medium`}>{r.requester || '-'}</td>
                      {/* 구매처 */}
                      <td className={`${tdClass} text-gray-700`}>{r.platform || '-'}</td>
                      {/* 키워드 */}
                      <td className={`${tdClass} font-medium text-gray-900 max-w-[140px] truncate`}>{r.keyword || '-'}</td>
                      {/* 구매옵션 */}
                      <td className={`${tdClass} text-gray-600 max-w-[120px] truncate`}>{r.option || '-'}</td>
                      {/* 상품가 */}
                      <td className={`${tdClass} font-semibold text-gray-900`}>{r.product_price != null ? r.product_price.toLocaleString() + '원' : '-'}</td>
                      {/* 리뷰비용 */}
                      <td className={`${tdClass} font-semibold text-gray-900`}>{r.review_cost?.toLocaleString() ?? '-'}원</td>
                      {/* 주문번호 */}
                      <td className={`${tdClass} font-mono text-gray-500 max-w-[130px] truncate`}>{r.order_number || '-'}</td>
                      {/* 구매자 */}
                      <td className={`${tdClass} text-gray-700`}>{r.buyer || '-'}</td>
                      {/* 수취인 */}
                      <td className={`${tdClass} text-gray-700`}>{r.recipient || '-'}</td>
                      {/* 전화번호 */}
                      <td className={`${tdClass} text-gray-600`}>{r.phone || '-'}</td>
                      {/* 주소 */}
                      <td className={`${tdClass} text-gray-600 max-w-[160px] truncate`}>{r.address || '-'}</td>
                      {/* 은행명 */}
                      <td className={`${tdClass} text-gray-700`}>{r.bank || '-'}</td>
                      {/* 계좌번호 */}
                      <td className={`${tdClass} font-mono text-gray-600`}>{r.account || '-'}</td>
                      {/* 예금주 */}
                      <td className={`${tdClass} font-semibold text-gray-900`}>{r.depositor || '-'}</td>
                      {/* 리뷰타입 */}
                      <td className={tdClass}>
                        {r.review_type ? (
                          <span className="px-1.5 py-0.5 bg-red-600 text-white text-[11px] font-bold rounded">{r.review_type}</span>
                        ) : '-'}
                      </td>
                      {/* 상태변경 */}
                      <td className={tdClass} onClick={e => e.stopPropagation()}>
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => changeStatus(r.id, '대기중')}
                            disabled={r.status === '대기중'}
                            className="px-1.5 py-0.5 bg-gray-700 text-white text-[11px] font-semibold rounded disabled:opacity-25 hover:bg-gray-600 transition-colors"
                          >대기</button>
                          <button
                            onClick={() => changeStatus(r.id, '리뷰완료')}
                            disabled={r.status === '리뷰완료'}
                            className="px-1.5 py-0.5 bg-red-500 text-white text-[11px] font-semibold rounded disabled:opacity-25 hover:bg-red-600 transition-colors"
                          >완료</button>
                        </div>
                      </td>
                      {/* 이미지 */}
                      <td className={tdClass} onClick={e => e.stopPropagation()}>
                        <div className="flex justify-center gap-1">
                          {r.image1_url && <a href={r.image1_url} target="_blank" rel="noreferrer"><img src={r.image1_url} alt="" className="w-8 h-8 object-cover rounded border border-gray-200 hover:opacity-80" /></a>}
                          {r.image2_url && <a href={r.image2_url} target="_blank" rel="noreferrer"><img src={r.image2_url} alt="" className="w-8 h-8 object-cover rounded border border-gray-200 hover:opacity-80" /></a>}
                          {r.review_image_url && <a href={r.review_image_url} target="_blank" rel="noreferrer"><img src={r.review_image_url} alt="" className="w-8 h-8 object-cover rounded border-2 border-red-400 hover:opacity-80" /></a>}
                        </div>
                      </td>
                    </tr>

                    {/* 펼침: 이미지 상세 */}
                    {expandedId === r.id && (
                      <tr key={`d-${r.id}`} className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800">
                        <td colSpan={20} className="px-5 py-3">
                          <div className="flex flex-wrap items-start gap-6">
                            <div className="flex gap-3">
                              {r.image1_url && (
                                <a href={r.image1_url} target="_blank" rel="noreferrer" className="group text-center">
                                  <img src={r.image1_url} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-200 group-hover:opacity-80 transition-opacity" />
                                  <p className="text-[11px] text-gray-400 mt-0.5">구매①</p>
                                </a>
                              )}
                              {r.image2_url && (
                                <a href={r.image2_url} target="_blank" rel="noreferrer" className="group text-center">
                                  <img src={r.image2_url} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-200 group-hover:opacity-80 transition-opacity" />
                                  <p className="text-[11px] text-gray-400 mt-0.5">구매②</p>
                                </a>
                              )}
                              {r.review_image_url && (
                                <a href={r.review_image_url} target="_blank" rel="noreferrer" className="group text-center">
                                  <img src={r.review_image_url} alt="" className="w-16 h-16 object-cover rounded-lg border-2 border-red-400 group-hover:opacity-80 transition-opacity" />
                                  <p className="text-[11px] text-red-500 font-bold mt-0.5">리뷰</p>
                                </a>
                              )}
                              {!r.image1_url && !r.image2_url && !r.review_image_url && (
                                <span className="text-xs text-gray-400 self-center">이미지 없음</span>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 mt-3">
            <button
              onClick={() => { setPage(1); setExpandedId(null) }}
              disabled={page === 1}
              className="px-2 py-1 rounded text-xs border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
            >«</button>
            <button
              onClick={() => { setPage(p => Math.max(1, p - 1)); setExpandedId(null) }}
              disabled={page === 1}
              className="px-2 py-1 rounded text-xs border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
            >‹</button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...')
                acc.push(p)
                return acc
              }, [])
              .map((p, i) =>
                p === '...'
                  ? <span key={`e${i}`} className="px-1.5 text-xs text-gray-400 dark:text-gray-500">…</span>
                  : <button
                      key={p}
                      onClick={() => { setPage(p as number); setExpandedId(null) }}
                      className={`min-w-[28px] px-2 py-1 rounded text-xs border transition-colors ${
                        page === p
                          ? 'bg-gray-900 text-white border-gray-900 font-bold'
                          : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >{p}</button>
              )}

            <button
              onClick={() => { setPage(p => Math.min(totalPages, p + 1)); setExpandedId(null) }}
              disabled={page === totalPages}
              className="px-2 py-1 rounded text-xs border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
            >›</button>
            <button
              onClick={() => { setPage(totalPages); setExpandedId(null) }}
              disabled={page === totalPages}
              className="px-2 py-1 rounded text-xs border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
            >»</button>
            <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">{page} / {totalPages} 페이지</span>
          </div>
        )}
      </div>
    </div>
  )
}
