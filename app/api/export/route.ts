import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import * as XLSX from 'xlsx'

export async function GET(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status   = searchParams.get('status')    || ''
  const search   = searchParams.get('search')    || ''
  const platform = searchParams.get('platform')  || ''
  const keyword  = searchParams.get('keyword')   || ''
  const dateFrom = searchParams.get('date_from') || ''
  const dateTo   = searchParams.get('date_to')   || ''

  const rows = await sql`
    SELECT * FROM purchase_requests
    WHERE
      (${status}   = '' OR status   = ${status})
      AND (${platform} = '' OR platform = ${platform})
      AND (${keyword}  = '' OR keyword  = ${keyword})
      AND (${search}   = '' OR depositor    ILIKE ${'%' + search + '%'}
                            OR order_number ILIKE ${'%' + search + '%'}
                            OR buyer        ILIKE ${'%' + search + '%'})
      AND (${dateFrom} = '' OR created_at >= ${dateFrom}::date)
      AND (${dateTo}   = '' OR created_at <  (${dateTo}::date + interval '1 day'))
    ORDER BY created_at DESC
  `

  const fmt = (iso: string) => {
    const d = new Date(iso)
    return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  }

  const data = rows.map((r: Record<string, unknown>) => ({
    '제출일시':    fmt(r.created_at as string),
    '상태':        r.status        ?? '',
    '요청자':      r.requester     ?? '',
    '구매처':      r.platform      ?? '',
    '키워드':      r.keyword       ?? '',
    '구매옵션':    r.option        ?? '',
    '상품가':      r.product_price ?? '',
    '리뷰비용':    r.review_cost   ?? '',
    '주문번호':    r.order_number  ?? '',
    '구매자':      r.buyer         ?? '',
    '수취인':      r.recipient     ?? '',
    '전화번호':    r.phone         ?? '',
    '주소':        r.address       ?? '',
    '은행명':      r.bank          ?? '',
    '계좌번호':    r.account       ?? '',
    '예금주':      r.depositor     ?? '',
    '구매이미지1': r.image1_url    ?? '',
    '구매이미지2': r.image2_url    ?? '',
    '리뷰이미지':  r.review_image_url ?? '',
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '구매신청목록')
  const buf: Uint8Array = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })

  const today = new Date().toISOString().split('T')[0]
  const filename = encodeURIComponent(`구매신청목록_${today}.xlsx`)

  return new NextResponse(Buffer.from(buf), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename*=UTF-8''${filename}`,
    },
  })
}
