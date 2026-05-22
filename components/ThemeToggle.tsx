'use client'

import { useTheme } from './ThemeProvider'

const MODES = [
  {
    key: 'light',
    label: '라이트',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z" />
      </svg>
    ),
  },
  {
    key: 'dark',
    label: '다크',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    ),
  },
  {
    key: 'system',
    label: '시스템',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
] as const

export default function ThemeToggle({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const { theme, setTheme } = useTheme()

  const baseBtn = variant === 'dark'
    ? 'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors'
    : 'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors'

  const activeClass = variant === 'dark'
    ? 'bg-white text-gray-900'
    : 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'

  const inactiveClass = variant === 'dark'
    ? 'text-gray-400 hover:text-white hover:bg-gray-700'
    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700'

  return (
    <div className={`flex items-center gap-0.5 rounded-lg p-0.5 ${
      variant === 'dark'
        ? 'bg-gray-800'
        : 'bg-gray-100 dark:bg-gray-800'
    }`}>
      {MODES.map(({ key, label, icon }) => (
        <button
          key={key}
          onClick={() => setTheme(key)}
          title={`${label} 모드`}
          className={`${baseBtn} ${theme === key ? activeClass : inactiveClass}`}
        >
          {icon}
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  )
}
