import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function POST(req: Request) {
  const { id, review_image_url } = await req.json()

  await sql`
    UPDATE purchase_requests
    SET review_image_url=${review_image_url}, status='리뷰완료'
    WHERE id=${id}
  `
  return NextResponse.json({ ok: true })
}
