import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await sql`
    SELECT id, username, display_name, role, is_active, created_at
    FROM admin_users ORDER BY created_at ASC
  `
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session || session.role !== 'super')
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })

  const { username, display_name, password, role } = await req.json()
  if (!username || !password) return NextResponse.json({ error: '필수 항목 누락' }, { status: 400 })

  const password_hash = await bcrypt.hash(password, 10)
  try {
    const [row] = await sql`
      INSERT INTO admin_users (username, display_name, password_hash, role)
      VALUES (${username}, ${display_name ?? ''}, ${password_hash}, ${role ?? 'admin'})
      RETURNING id, username, display_name, role, is_active, created_at
    `
    return NextResponse.json(row)
  } catch {
    return NextResponse.json({ error: '이미 사용 중인 아이디입니다.' }, { status: 409 })
  }
}

export async function PATCH(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, password, display_name, role, is_active } = await req.json()

  // 비밀번호 변경: 본인 또는 super
  if (password !== undefined) {
    if (session.role !== 'super' && session.id !== id)
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    const password_hash = await bcrypt.hash(password, 10)
    await sql`UPDATE admin_users SET password_hash = ${password_hash} WHERE id = ${id}`
  }

  // 나머지 필드: super만 가능
  if (display_name !== undefined || role !== undefined || is_active !== undefined) {
    if (session.role !== 'super')
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    if (display_name !== undefined) await sql`UPDATE admin_users SET display_name = ${display_name} WHERE id = ${id}`
    if (role !== undefined) await sql`UPDATE admin_users SET role = ${role} WHERE id = ${id}`
    if (is_active !== undefined) await sql`UPDATE admin_users SET is_active = ${is_active} WHERE id = ${id}`
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const session = await getSession()
  if (!session || session.role !== 'super')
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })

  const { id } = await req.json()
  if (id === session.id) return NextResponse.json({ error: '본인 계정은 삭제할 수 없습니다.' }, { status: 400 })

  await sql`DELETE FROM admin_users WHERE id = ${id}`
  return NextResponse.json({ ok: true })
}
