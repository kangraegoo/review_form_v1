import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await sql`
    SELECT * FROM notices ORDER BY sort_order ASC, created_at DESC
  `
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { type, title, content, author, is_active, start_at, end_at, sort_order } = await req.json()
  const [row] = await sql`
    INSERT INTO notices (type, title, content, author, is_active, start_at, end_at, sort_order)
    VALUES (
      ${type ?? '공지'},
      ${title},
      ${content ?? ''},
      ${author ?? ''},
      ${is_active ?? true},
      ${start_at || null},
      ${end_at || null},
      ${sort_order ?? 0}
    )
    RETURNING *
  `
  return NextResponse.json(row)
}

export async function PATCH(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, type, title, content, author, is_active, start_at, end_at, sort_order } = await req.json()
  await sql`
    UPDATE notices SET
      type       = ${type},
      title      = ${title},
      content    = ${content},
      author     = ${author ?? ''},
      is_active  = ${is_active},
      start_at   = ${start_at || null},
      end_at     = ${end_at || null},
      sort_order = ${sort_order ?? 0}
    WHERE id = ${id}
  `
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  await sql`DELETE FROM notices WHERE id = ${id}`
  return NextResponse.json({ ok: true })
}
