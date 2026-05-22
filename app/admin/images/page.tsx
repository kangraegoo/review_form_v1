import { sql } from '@/lib/db'
import AdminNav from '@/components/admin/AdminNav'

export const dynamic = 'force-dynamic'

type Request = {
  id: number
  created_at: string
  depositor: string
  keyword: string
  image1_url: string
  image2_url: string
  review_image_url: string
}

export default async function ImagesPage() {
  const rows = (await sql`
    SELECT id, created_at, depositor, keyword, image1_url, image2_url, review_image_url
    FROM purchase_requests
    WHERE image1_url IS NOT NULL OR image2_url IS NOT NULL OR review_image_url IS NOT NULL
    ORDER BY created_at DESC
    LIMIT 200
  `) as Request[]

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return `${d.getMonth() + 1}/${d.getDate()}`
  }

  const images = rows.flatMap(r => [
    r.image1_url ? { url: r.image1_url, type: '구매', depositor: r.depositor, keyword: r.keyword, date: r.created_at } : null,
    r.image2_url ? { url: r.image2_url, type: '구매2', depositor: r.depositor, keyword: r.keyword, date: r.created_at } : null,
    r.review_image_url ? { url: r.review_image_url, type: '리뷰', depositor: r.depositor, keyword: r.keyword, date: r.created_at } : null,
  ]).filter(Boolean) as { url: string; type: string; depositor: string; keyword: string; date: string }[]

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold text-gray-900">이미지 갤러리</h1>
          <span className="text-sm text-gray-500">총 {images.length}장</span>
        </div>

        {images.length === 0 ? (
          <div className="text-center text-gray-400 py-20">업로드된 이미지가 없습니다.</div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {images.map((img, i) => (
              <a key={i} href={img.url} target="_blank" rel="noreferrer" className="group relative block aspect-square">
                <img
                  src={img.url}
                  alt=""
                  className="w-full h-full object-cover rounded-lg border border-gray-200 group-hover:opacity-80 transition-opacity"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-lg flex flex-col items-start justify-end p-1.5 opacity-0 group-hover:opacity-100">
                  <span className={`text-white text-xs font-bold px-1.5 py-0.5 rounded mb-0.5 ${img.type === '리뷰' ? 'bg-red-600' : 'bg-gray-700'}`}>
                    {img.type}
                  </span>
                  <span className="text-white text-xs truncate w-full">{img.depositor}</span>
                  <span className="text-gray-300 text-xs">{formatDate(img.date)}</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
