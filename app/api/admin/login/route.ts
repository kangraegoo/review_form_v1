import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { signToken, setSessionCookie } from '@/lib/auth'
import { sql } from '@/lib/db'

export async function POST(req: Request) {
  const { username, password } = await req.json()

  const rows = await sql`
    SELECT id, username, display_name, password_hash, role, is_active
    FROM admin_users WHERE username = ${username}
  `
  const user = rows[0]

  if (!user || !user.is_active) {
    return NextResponse.json({ error: '아이디 또는 비밀번호가 틀렸습니다.' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, user.password_hash as string)
  if (!valid) {
    return NextResponse.json({ error: '아이디 또는 비밀번호가 틀렸습니다.' }, { status: 401 })
  }

  const token = await signToken({
    id: user.id as number,
    username: user.username as string,
    name: user.display_name as string,
    role: user.role as string,
  })
  await setSessionCookie(token)
  return NextResponse.json({ ok: true })
}
