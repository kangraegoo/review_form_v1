import { sql } from '@/lib/db'
import AdminNav from '@/components/admin/AdminNav'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type Request = {
  id: number
  created_at: string
  platform: string
  keyword: string
  option: string
  review_cost: number
  depositor: string
  status: string
}

export default async function DashboardPage() {
  const [totalRow] = await sql`SELECT COUNT(*) as count FROM purchase_requests`
  const [pendingRow] = await sql`SELECT COUNT(*) as count FROM purchase_requests WHERE status = '대기중'`
  const [doneRow] = await sql`SELECT COUNT(*) as count FROM purchase_requests WHERE status = '리뷰완료'`
  const [todayRow] = await sql`
    SELECT COUNT(*) as count FROM purchase_requests
    WHERE created_at::date = CURRENT_DATE
  `
  const recent = (await sql`
    SELECT id, created_at, platform, keyword, option, review_cost, depositor, status
    FROM purchase_requests
    ORDER BY created_at DESC
    LIMIT 10
  `) as Request[]

  const stats = [
    { label: '전체 신청', value: Number(totalRow.count), color: 'bg-gray-900 text-white' },
    { label: '오늘 신청', value: Number(todayRow.count), color: 'bg-blue-600 text-white' },
    { label: '대기중', value: Number(pendingRow.count), color: 'bg-yellow-500 text-white' },
    { label: '리뷰완료', value: Number(doneRow.count), color: 'bg-red-600 text-white' },
  ]

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-5">대시보드</h1>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {stats.map(({ label, value, color }) => (
            <div key={label} className={`${color} rounded-xl p-4`}>
              <p className="text-xs font-medium opacity-75 mb-1">{label}</p>
              <p className="text-3xl font-bold">{value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* 최근 신청 목록 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-800">최근 신청</h2>
            <Link href="/admin/requests" className="text-xs text-gray-500 hover:text-gray-900">
              전체 보기 →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">일시</th>
                  <th className="text-left px-4 py-2 font-medium">예금주</th>
                  <th className="text-left px-4 py-2 font-medium">키워드</th>
                  <th className="text-left px-4 py-2 font-medium">옵션</th>
                  <th className="text-right px-4 py-2 font-medium">비용</th>
                  <th className="text-center px-4 py-2 font-medium">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recent.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-400 py-8 text-sm">
                      신청 내역이 없습니다.
                    </td>
                  </tr>
                ) : recent.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(r.created_at)}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{r.depositor}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-32 truncate">{r.keyword}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-28 truncate">{r.option}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{r.review_cost?.toLocaleString()}원</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 text-xs font-bold rounded text-white ${
                        r.status === '리뷰완료' ? 'bg-red-600' : 'bg-gray-700'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
