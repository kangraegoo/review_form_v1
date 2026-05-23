'use client'

import { useTheme } from './ThemeProvider'

type Mode = 'light' | 'dark' | 'system'

const CYCLE: { key: Mode; title: string; icon: React.ReactNode }[] = [
  {
    key: 'light',
    title: '라이트 모드',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z" />
      </svg>
    ),
  },
  {
    key: 'dark',
    title: '다크 모드',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    ),
  },
  {
    key: 'system',
    title: '시스템',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
]

export default function ThemeToggle({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const { theme, setTheme } = useTheme()

  function cycleTheme() {
    const idx = CYCLE.findIndex(m => m.key === theme)
    const next = CYCLE[(idx + 1) % CYCLE.length]
    setTheme(next.key)
  }

  const current = CYCLE.find(m => m.key === theme) ?? CYCLE[2]

  const btnClass = variant === 'dark'
    ? 'p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors'
    : 'p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 transition-colors'

  return (
    <button onClick={cycleTheme} title={current.title} className={btnClass}>
      {current.icon}
    </button>
  )
}
