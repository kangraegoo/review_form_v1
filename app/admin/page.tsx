import { sql } from '@/lib/db'
import AdminNav from '@/components/admin/AdminNav'
import Link from 'next/link'
import DashboardChart from '@/components/admin/DashboardChart'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [
    [totalRow],
    [pendingRow],
    [doneRow],
    [todayRow],
    [todayCostRow],
    [monthCostRow],
    dailyRows,
    requesterRows,
    platformRows,
    keywordRows,
    recent,
  ] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM purchase_requests`,
    sql`SELECT COUNT(*) as count FROM purchase_requests WHERE status = '대기중'`,
    sql`SELECT COUNT(*) as count FROM purchase_requests WHERE status = '리뷰완료'`,
    sql`SELECT COUNT(*) as count FROM purchase_requests WHERE created_at::date = CURRENT_DATE`,
    sql`SELECT COALESCE(SUM(review_cost),0) as total FROM purchase_requests WHERE created_at::date = CURRENT_DATE`,
    sql`SELECT COALESCE(SUM(review_cost),0) as total FROM purchase_requests WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)`,
    sql`
      SELECT TO_CHAR(created_at::date, 'MM/DD') as date, COUNT(*) as count
      FROM purchase_requests
      WHERE created_at >= CURRENT_DATE - INTERVAL '13 days'
      GROUP BY created_at::date, TO_CHAR(created_at::date, 'MM/DD')
      ORDER BY created_at::date
    `,
    sql`
      SELECT requester,
             COUNT(*) as total,
             COUNT(*) FILTER (WHERE status = '대기중') as pending,
             COUNT(*) FILTER (WHERE status = '리뷰완료') as done,
             COALESCE(SUM(review_cost),0) as cost_sum
      FROM purchase_requests
      WHERE requester IS NOT NULL AND requester != ''
      GROUP BY requester
      ORDER BY total DESC
    `,
    sql`
      SELECT platform, COUNT(*) as total
      FROM purchase_requests
      WHERE platform IS NOT NULL AND platform != ''
      GROUP BY platform
      ORDER BY total DESC
      LIMIT 5
    `,
    sql`
      SELECT keyword, COUNT(*) as total
      FROM purchase_requests
      WHERE keyword IS NOT NULL AND keyword != ''
      GROUP BY keyword
      ORDER BY total DESC
      LIMIT 5
    `,
    sql`
      SELECT pr.id, pr.created_at, pr.requester, pr.platform, pr.keyword, pr.option,
             pr.product_price, pr.review_cost, pr.depositor, pr.status,
             k.review_type
      FROM purchase_requests pr
      LEFT JOIN keywords k
        ON k.requester = pr.requester
        AND k.platform = pr.platform
        AND k.keyword  = pr.keyword
        AND k.option   = pr.option
      ORDER BY pr.created_at DESC
      LIMIT 10
    `,
  ])

  // 최근 14일 날짜 채우기 (데이터 없는 날 = 0)
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    return d.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }).replace('. ', '/').replace('.', '')
  })
  const dailyMap = Object.fromEntries((dailyRows as { date: string; count: number }[]).map(r => [r.date, Number(r.count)]))
  const chartData = last14.map(date => ({ date, count: dailyMap[date] ?? 0 }))

  const fmt = (iso: string) => {
    const d = new Date(iso)
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  const statCards = [
    { label: '전체 신청', value: Number(totalRow.count).toLocaleString() + '건', bg: 'bg-gray-900', text: 'text-white' },
    { label: '오늘 신청', value: Number(todayRow.count).toLocaleString() + '건', bg: 'bg-blue-600', text: 'text-white' },
    { label: '대기중', value: Number(pendingRow.count).toLocaleString() + '건', bg: 'bg-amber-500', text: 'text-white' },
    { label: '리뷰완료', value: Number(doneRow.count).toLocaleString() + '건', bg: 'bg-red-600', text: 'text-white' },
    { label: '오늘 리뷰비용', value: Number(todayCostRow.total).toLocaleString() + '원', bg: 'bg-white', text: 'text-gray-900', border: true },
    { label: '이번달 리뷰비용', value: Number(monthCostRow.total).toLocaleString() + '원', bg: 'bg-white', text: 'text-gray-900', border: true },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* 상단 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {statCards.map(({ label, value, bg, text, border }) => (
            <div key={label} className={`${bg} ${border ? 'border border-gray-200' : ''} rounded-xl p-4 shadow-sm`}>
              <p className={`text-xs font-medium mb-1 ${border ? 'text-gray-500' : 'opacity-75 ' + text}`}>{label}</p>
              <p className={`text-xl font-bold ${text}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* 일별 신청 추이 + 요청자별 통계 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 차트 */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-4">
            <h2 className="text-sm font-bold text-gray-800 mb-4">일별 신청 추이 (최근 14일)</h2>
            <DashboardChart data={chartData} />
          </div>

          {/* 요청자별 통계 */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="text-sm font-bold text-gray-800 mb-3">요청자별 통계</h2>
            {(requesterRows as { requester: string; total: number; pending: number; done: number; cost_sum: number }[]).length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">데이터 없음</p>
            ) : (
              <div className="space-y-3">
                {(requesterRows as { requester: string; total: number; pending: number; done: number; cost_sum: number }[]).map(r => (
                  <div key={r.requester}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-900">{r.requester}</span>
                      <span className="text-xs text-gray-500">{Number(r.total)}건</span>
                    </div>
                    <div className="flex gap-1 text-[11px] mb-1">
                      <span className="px-1.5 py-0.5 bg-gray-800 text-white rounded font-bold">대기 {Number(r.pending)}</span>
                      <span className="px-1.5 py-0.5 bg-red-600 text-white rounded font-bold">완료 {Number(r.done)}</span>
                    </div>
                    <p className="text-xs text-gray-500">리뷰비용 합계 <span className="font-bold text-gray-800">{Number(r.cost_sum).toLocaleString()}원</span></p>
                    <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${Number(r.total) > 0 ? (Number(r.done) / Number(r.total)) * 100 : 0}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">리뷰 완료율 {Number(r.total) > 0 ? Math.round((Number(r.done) / Number(r.total)) * 100) : 0}%</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 구매처 TOP5 + 키워드 TOP5 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="text-sm font-bold text-gray-800 mb-3">구매처 TOP 5</h2>
            {(platformRows as { platform: string; total: number }[]).map((r, i) => {
              const max = Number((platformRows as { platform: string; total: number }[])[0]?.total ?? 1)
              return (
                <div key={r.platform} className="flex items-center gap-3 mb-2.5">
                  <span className="w-4 text-[11px] font-bold text-gray-400">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="font-medium text-gray-800">{r.platform}</span>
                      <span className="text-gray-500">{Number(r.total)}건</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(Number(r.total) / max) * 100}%` }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="text-sm font-bold text-gray-800 mb-3">키워드 TOP 5</h2>
            {(keywordRows as { keyword: string; total: number }[]).map((r, i) => {
              const max = Number((keywordRows as { keyword: string; total: number }[])[0]?.total ?? 1)
              return (
                <div key={r.keyword} className="flex items-center gap-3 mb-2.5">
                  <span className="w-4 text-[11px] font-bold text-gray-400">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="font-medium text-gray-800 truncate max-w-[180px]">{r.keyword}</span>
                      <span className="text-gray-500 shrink-0">{Number(r.total)}건</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-800 rounded-full" style={{ width: `${(Number(r.total) / max) * 100}%` }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 최근 신청 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-800">최근 신청</h2>
            <Link href="/admin/requests" className="text-xs text-gray-500 hover:text-gray-900 transition-colors">
              전체 보기 →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>
                  <th className="text-left px-3 py-2 font-medium whitespace-nowrap">일시</th>
                  <th className="text-left px-3 py-2 font-medium">요청자</th>
                  <th className="text-left px-3 py-2 font-medium">예금주</th>
                  <th className="text-left px-3 py-2 font-medium">키워드</th>
                  <th className="text-left px-3 py-2 font-medium">구매옵션</th>
                  <th className="text-right px-3 py-2 font-medium whitespace-nowrap">상품가</th>
                  <th className="text-right px-3 py-2 font-medium whitespace-nowrap">리뷰비용</th>
                  <th className="text-center px-3 py-2 font-medium">리뷰타입</th>
                  <th className="text-center px-3 py-2 font-medium">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(recent as { id: number; created_at: string; requester: string; platform: string; keyword: string; option: string; product_price: number; review_cost: number; depositor: string; status: string; review_type: string }[]).length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center text-gray-400 py-8 text-sm">신청 내역이 없습니다.</td>
                  </tr>
                ) : (recent as { id: number; created_at: string; requester: string; platform: string; keyword: string; option: string; product_price: number; review_cost: number; depositor: string; status: string; review_type: string }[]).map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap">{fmt(r.created_at)}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{r.requester || '-'}</td>
                    <td className="px-3 py-2.5 font-medium text-gray-900 whitespace-nowrap">{r.depositor}</td>
                    <td className="px-3 py-2.5 text-gray-700 max-w-[120px] truncate text-xs">{r.keyword}</td>
                    <td className="px-3 py-2.5 text-gray-600 max-w-[100px] truncate text-xs">{r.option || '-'}</td>
                    <td className="px-3 py-2.5 text-right text-gray-700 text-xs whitespace-nowrap">{r.product_price != null ? r.product_price.toLocaleString() + '원' : '-'}</td>
                    <td className="px-3 py-2.5 text-right text-gray-700 text-xs whitespace-nowrap">{r.review_cost?.toLocaleString()}원</td>
                    <td className="px-3 py-2.5 text-center">
                      {r.review_type ? (
                        <span className="px-1.5 py-0.5 bg-red-600 text-white text-[11px] font-bold rounded">{r.review_type}</span>
                      ) : <span className="text-gray-300">-</span>}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`px-2 py-0.5 text-[11px] font-bold rounded text-white ${r.status === '리뷰완료' ? 'bg-red-600' : 'bg-gray-700'}`}>
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
