import { neon } from '@neondatabase/serverless'
import bcrypt from 'bcryptjs'

export const sql = neon(process.env.DATABASE_URL!)

export async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS keywords (
      id SERIAL PRIMARY KEY,
      requester TEXT DEFAULT '',
      platform TEXT NOT NULL,
      keyword TEXT NOT NULL,
      option TEXT NOT NULL,
      review_cost INTEGER DEFAULT 0,
      review_type TEXT DEFAULT '',
      product_price INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `
  await sql`ALTER TABLE keywords ADD COLUMN IF NOT EXISTS requester TEXT DEFAULT ''`
  await sql`ALTER TABLE keywords ADD COLUMN IF NOT EXISTS product_price INTEGER DEFAULT 0`

  await sql`
    CREATE TABLE IF NOT EXISTS purchase_requests (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP DEFAULT NOW(),
      requester TEXT DEFAULT '',
      platform TEXT,
      keyword TEXT,
      option TEXT,
      review_cost INTEGER,
      product_price INTEGER,
      order_number TEXT,
      buyer TEXT,
      recipient TEXT,
      phone TEXT,
      address TEXT,
      bank TEXT,
      account TEXT,
      depositor TEXT,
      image1_url TEXT,
      image2_url TEXT,
      status TEXT DEFAULT '대기중',
      review_image_url TEXT
    )
  `
  await sql`ALTER TABLE purchase_requests ADD COLUMN IF NOT EXISTS requester TEXT DEFAULT ''`
  await sql`ALTER TABLE purchase_requests ADD COLUMN IF NOT EXISTS product_price INTEGER`

  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL DEFAULT '',
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `
  const defaultHash = await bcrypt.hash('admin1234', 10)
  await sql`
    INSERT INTO admin_users (username, display_name, password_hash, role)
    SELECT 'admin', '관리자', ${defaultHash}, 'super'
    WHERE NOT EXISTS (SELECT 1 FROM admin_users WHERE username = 'admin')
  `
}
