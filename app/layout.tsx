import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '공식 리뷰 관리 폼_v1',
  description: '구매 신청 및 리뷰 제출',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full bg-gray-50">{children}</body>
    </html>
  )
}
