import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file') as File
  const folder = (formData.get('folder') as string) || 'uploads'

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const ext = file.name.split('.').pop()
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const token = process.env.BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN ?? process.env.BLOB_READ_WRITE_TOKEN
  const blob = await put(filename, file, { access: 'public', token })
  return NextResponse.json({ url: blob.url })
}
