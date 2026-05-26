import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const depositor = searchParams.get('depositor')
  const all = searchParams.get('all')

  if (depositor) {
    const rows = await sql`
      SELECT * FROM purchase_requests
      WHERE depositor = ${depositor.trim()}
      ORDER BY created_at DESC
    `
    return NextResponse.json(rows)
  }

  if (all) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const status    = searchParams.get('status')    || ''
    const search    = searchParams.get('search')    || ''
    const platform  = searchParams.get('platform')  || ''
    const keyword   = searchParams.get('keyword')   || ''
    const dateFrom  = searchParams.get('date_from') || ''
    const dateTo    = searchParams.get('date_to')   || ''

    const rows = await sql`
      SELECT * FROM purchase_requests
      WHERE
        (${status}   = '' OR status   = ${status})
        AND (${platform} = '' OR platform = ${platform})
        AND (${keyword}  = '' OR keyword  = ${keyword})
        AND (${search}   = '' OR depositor   ILIKE ${'%' + search + '%'}
                              OR order_number ILIKE ${'%' + search + '%'}
                              OR buyer        ILIKE ${'%' + search + '%'})
        AND (${dateFrom} = '' OR created_at >= ${dateFrom}::date)
        AND (${dateTo}   = '' OR created_at <  (${dateTo}::date + interval '1 day'))
      ORDER BY created_at DESC
    `
    return NextResponse.json(rows)
  }

  return NextResponse.json({ error: 'Bad request' }, { status: 400 })
}

export async function POST(req: Request) {
  const body = await req.json()
  const {
    requester, platform, keyword, option, review_cost, product_price,
    order_number, buyer, recipient, phone, address,
    bank, account, depositor, image1_url, image2_url,
  } = body

  const [row] = await sql`
    INSERT INTO purchase_requests
      (requester, platform, keyword, option, review_cost, product_price, review_type, order_number, buyer, recipient,
       phone, address, bank, account, depositor, image1_url, image2_url)
    VALUES
      (${requester ?? ''}, ${platform}, ${keyword}, ${option}, ${review_cost}, ${product_price ?? null},
       ${body.review_type ?? ''}, ${order_number}, ${buyer}, ${recipient},
       ${phone}, ${address}, ${bank}, ${account}, ${depositor}, ${image1_url}, ${image2_url})
    RETURNING id
  `
  return NextResponse.json({ ok: true, id: row.id })
}

export async function PATCH(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, status } = await req.json()
  await sql`UPDATE purchase_requests SET status=${status} WHERE id=${id}`
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { ids } = await req.json()
  if (!Array.isArray(ids) || ids.length === 0)
    return NextResponse.json({ error: 'ids required' }, { status: 400 })

  await sql`DELETE FROM purchase_requests WHERE id = ANY(${ids})`
  return NextResponse.json({ ok: true })
}
