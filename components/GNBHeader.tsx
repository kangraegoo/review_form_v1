'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeToggle from './ThemeToggle'

export default function GNBHeader() {
  const pathname = usePathname()

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

        {/* 테마 토글 */}
        <ThemeToggle variant="light" />

        {/* 관리자 버튼 */}
        <Link
          href="/admin"
          className="shrink-0 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 transition-colors"
        >
          관리자
        </Link>
      </div>
    </header>
  )
}
