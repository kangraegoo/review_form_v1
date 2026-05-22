import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { signToken, setSessionCookie } from '@/lib/auth'

export async function POST(req: Request) {
  const { username, password } = await req.json()

  if (username !== process.env.ADMIN_USERNAME) {
    return NextResponse.json({ error: '아이디 또는 비밀번호가 틀렸습니다.' }, { status: 401 })
  }

  const hash = process.env.ADMIN_PASSWORD_HASH!
  const valid = await bcrypt.compare(password, hash)

  if (!valid) {
    return NextResponse.json({ error: '아이디 또는 비밀번호가 틀렸습니다.' }, { status: 401 })
  }

  const token = await signToken()
  await setSessionCookie(token)
  return NextResponse.json({ ok: true })
}
