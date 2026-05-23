import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  const today = new Date().toISOString().split('T')[0]
  const rows = await sql`
    SELECT id, type, title, content, author
    FROM notices
    WHERE is_active = TRUE
      AND (start_at IS NULL OR start_at <= ${today}::date)
      AND (end_at   IS NULL OR end_at   >= ${today}::date)
    ORDER BY sort_order ASC, created_at DESC
  `
  return NextResponse.json(rows)
}
