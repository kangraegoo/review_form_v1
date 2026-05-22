import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const rows = await sql`SELECT * FROM keywords ORDER BY requester, platform, keyword, option`
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { requester, platform, keyword, option, review_cost, review_type, product_price } = body

  const [row] = await sql`
    INSERT INTO keywords (requester, platform, keyword, option, review_cost, review_type, product_price)
    VALUES (${requester ?? ''}, ${platform}, ${keyword}, ${option}, ${review_cost}, ${review_type}, ${product_price ?? 0})
    RETURNING *
  `
  return NextResponse.json(row)
}

export async function PUT(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, requester, platform, keyword, option, review_cost, review_type, product_price } = body

  const [row] = await sql`
    UPDATE keywords
    SET requester=${requester ?? ''}, platform=${platform}, keyword=${keyword}, option=${option},
        review_cost=${review_cost}, review_type=${review_type}, product_price=${product_price ?? 0}
    WHERE id=${id}
    RETURNING *
  `
  return NextResponse.json(row)
}

export async function DELETE(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  await sql`DELETE FROM keywords WHERE id=${id}`
  return NextResponse.json({ ok: true })
}
