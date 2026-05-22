import { NextResponse } from 'next/server'
import { initDB } from '@/lib/db'

// 최초 1회 실행 후 이 파일 삭제 권장
export async function GET() {
  await initDB()
  return NextResponse.json({ ok: true, message: 'DB 테이블 생성 완료' })
}
