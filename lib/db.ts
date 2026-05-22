import { neon } from '@neondatabase/serverless'

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
}
