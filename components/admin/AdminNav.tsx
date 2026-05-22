'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const NAV = [
  { href: '/admin', label: '대시보드', exact: true },
  { href: '/admin/requests', label: '구매신청 목록' },
  { href: '/admin/keywords', label: '키워드 설정' },
  { href: '/admin/images', label: '이미지 갤러리' },
]

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <div className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-1">
          <span className="text-sm font-bold mr-4 text-gray-300">ADMIN</span>
          {NAV.map(({ href, label, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  active ? 'bg-white text-gray-900' : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          로그아웃
        </button>
      </div>
    </div>
  )
}
