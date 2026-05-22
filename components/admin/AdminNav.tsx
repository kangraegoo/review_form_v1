'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const NAV = [
  { href: '/admin', label: '대시보드', exact: true },
  { href: '/admin/requests', label: '구매신청 목록' },
  { href: '/admin/keywords', label: '키워드 설정' },
  { href: '/admin/images', label: '이미지 갤러리' },
  { href: '/admin/users', label: '계정 관리' },
]

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [me, setMe] = useState<{ name: string; role: string } | null>(null)

  useEffect(() => {
    fetch('/api/admin/me')
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setMe({ name: d.name || d.username, role: d.role }))
      .catch(() => {})
  }, [])

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const visibleNav = NAV.filter(n => n.href !== '/admin/users' || me?.role === 'super')

  return (
    <div className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-1">
          <span className="text-sm font-bold mr-4 text-gray-300">ADMIN</span>
          {visibleNav.map(({ href, label, exact }) => {
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
        <div className="flex items-center gap-3">
          {me && (
            <span className="text-xs text-gray-400">
              {me.name}
              {me.role === 'super' && <span className="ml-1 text-[10px] px-1 py-0.5 bg-gray-700 rounded">Super</span>}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  )
}
