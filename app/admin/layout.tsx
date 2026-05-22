import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin — 공식 리뷰 관리 폼_v1',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
