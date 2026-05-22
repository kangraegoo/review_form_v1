import { del } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await sql`
    SELECT id, created_at, depositor, keyword, image1_url, image2_url, review_image_url
    FROM purchase_requests
    WHERE image1_url IS NOT NULL OR image2_url IS NOT NULL OR review_image_url IS NOT NULL
    ORDER BY created_at DESC
    LIMIT 500
  `
  return NextResponse.json(rows)
}

type DeleteItem = { requestId: number; field: string; url: string }

export async function DELETE(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { items }: { items: DeleteItem[] } = await req.json()
  if (!items?.length) return NextResponse.json({ error: 'items required' }, { status: 400 })

  const token = process.env.BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN ?? process.env.BLOB_READ_WRITE_TOKEN

  // Vercel Blob에서 삭제
  const urls = items.map(i => i.url)
  await del(urls, { token })

  // DB 필드별 그룹핑 후 NULL 처리
  const byField: Record<string, number[]> = {}
  for (const item of items) {
    if (!byField[item.field]) byField[item.field] = []
    byField[item.field].push(item.requestId)
  }

  if (byField.image1_url?.length)
    await sql`UPDATE purchase_requests SET image1_url = NULL WHERE id = ANY(${byField.image1_url})`
  if (byField.image2_url?.length)
    await sql`UPDATE purchase_requests SET image2_url = NULL WHERE id = ANY(${byField.image2_url})`
  if (byField.review_image_url?.length)
    await sql`UPDATE purchase_requests SET review_image_url = NULL WHERE id = ANY(${byField.review_image_url})`

  return NextResponse.json({ ok: true })
}
