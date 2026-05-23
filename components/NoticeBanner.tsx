'use client'

import { useEffect, useRef, useState } from 'react'

type Notice = { id: number; type: string; title: string; content: string; author: string }

const TYPE_STYLE: Record<string, string> = {
  '공지': 'bg-blue-600',
  '알림': 'bg-orange-500',
  '홍보': 'bg-green-600',
}

const INTERVAL = 4000
const FADE_MS  = 250

export default function NoticeBanner() {
  const [notices, setNotices]   = useState<Notice[]>([])
  const [idx, setIdx]           = useState(0)
  const [visible, setVisible]   = useState(true)
  const [expanded, setExpanded] = useState(false)
  const idxRef  = useRef(0)
  const paused  = useRef(false)

  useEffect(() => {
    fetch('/api/notices')
      .then(r => r.json())
      .then((rows: unknown) => { if (Array.isArray(rows) && rows.length > 0) setNotices(rows) })
      .catch(() => {})
  }, [])

  function goTo(next: number) {
    setVisible(false)
    setTimeout(() => {
      idxRef.current = next
      setIdx(next)
      setExpanded(false)
      setVisible(true)
    }, FADE_MS)
  }

  useEffect(() => {
    if (notices.length <= 1) return
    const timer = setInterval(() => {
      if (!paused.current) {
        goTo((idxRef.current + 1) % notices.length)
      }
    }, INTERVAL)
    return () => clearInterval(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notices.length])

  if (notices.length === 0) {
    return (
      <div className="bg-gray-800 dark:bg-gray-900 text-white">
        <div className="max-w-2xl mx-auto px-4 py-2 flex items-center gap-3">
          <span className="bg-gray-600 text-xs font-bold w-10 h-10 rounded-lg shrink-0 flex items-center justify-center">
            공지
          </span>
          <p className="text-xs text-gray-400">공지사항이 없습니다.</p>
        </div>
      </div>
    )
  }

  const notice = notices[idx]
  const total  = notices.length
  const badge  = TYPE_STYLE[notice.type] ?? 'bg-gray-600'

  return (
    <div
      className="bg-gray-800 dark:bg-gray-900 text-white"
      onMouseEnter={() => { paused.current = true }}
      onMouseLeave={() => { paused.current = false }}
    >
      <div className="max-w-2xl mx-auto px-4 py-2 flex items-center gap-3">
        {/* 타입 뱃지 */}
        <span className={`${badge} text-xs font-bold w-10 h-10 rounded-lg shrink-0 flex items-center justify-center`}>
          {notice.type}
        </span>

        {/* 내용 */}
        <div
          className="flex-1 min-w-0 transition-opacity"
          style={{ opacity: visible ? 1 : 0, transitionDuration: `${FADE_MS}ms` }}
        >
          <div className="flex items-baseline gap-1.5">
            <p className="text-xs font-semibold leading-snug truncate">{notice.title}</p>
            {notice.author && (
              <span className="text-[10px] text-gray-400 shrink-0">{notice.author}</span>
            )}
          </div>
          {notice.content && (
            notice.content.length <= 100
              ? <p className="text-[11px] text-gray-300 mt-0.5 leading-snug whitespace-pre-wrap">{notice.content}</p>
              : expanded
                ? <p className="text-[11px] text-gray-300 mt-0.5 leading-snug whitespace-pre-wrap">{notice.content}</p>
                : <button
                    onClick={() => setExpanded(true)}
                    className="text-[11px] text-gray-400 hover:text-gray-200 mt-0.5 underline underline-offset-2 transition-colors"
                  >
                    자세히 보기
                  </button>
          )}
        </div>

        {/* 번호 + 화살표 */}
        {total > 1 && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => goTo((idxRef.current - 1 + total) % total)}
              className="text-gray-500 hover:text-white transition-colors"
              aria-label="이전"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-[11px] text-gray-400 tabular-nums">{idx + 1} / {total}</span>
            <button
              onClick={() => goTo((idxRef.current + 1) % total)}
              className="text-gray-500 hover:text-white transition-colors"
              aria-label="다음"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
