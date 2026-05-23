'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import ThemeToggle from './ThemeToggle'

export default function GNBHeader() {
  const pathname = usePathname()
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 transition-colors">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-4">
        {/* 로고 */}
        <span className="text-sm font-bold text-gray-900 dark:text-white shrink-0">공식 리뷰 관리</span>

        {/* 탭 내비게이션 */}
        <nav className="flex flex-1 gap-1">
          <Link
            href="/"
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              pathname === '/'
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            구매 신청
          </Link>
          <Link
            href="/review"
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              pathname === '/review'
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            리뷰 제출
          </Link>
        </nav>

        {/* 테마 토글 + 공유 + 관리자 */}
        <div className="flex items-center gap-1 shrink-0">
          <ThemeToggle variant="light" />

          {/* 링크 복사 버튼 */}
          <div className="relative">
            <button
              onClick={handleCopy}
              title="링크 복사"
              className="p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 transition-colors"
            >
              {copied ? (
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              )}
            </button>
            {copied && (
              <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] bg-gray-900 text-white px-2 py-0.5 rounded whitespace-nowrap">
                복사됨!
              </span>
            )}
          </div>

          <Link
            href="/admin"
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 transition-colors"
          >
            관리자
          </Link>
        </div>
      </div>
    </header>
  )
}
