'use client'

import { useEffect, useRef, useState } from 'react'
import GNBHeader from '@/components/GNBHeader'

type KeywordRow = {
  id: number
  requester: string
  platform: string
  keyword: string
  option: string
  product_price: number
  review_cost: number
  review_type: string
}

type ImageFile = { file: File; preview: string }

export default function RequestPage() {
  const [keywords, setKeywords] = useState<KeywordRow[]>([])
  const [requester, setRequester] = useState('')
  const [platform, setPlatform] = useState('')
  const [keyword, setKeyword] = useState('')
  const [option, setOption] = useState('')
  const [productPrice, setProductPrice] = useState<number | null>(null)
  const [reviewCost, setReviewCost] = useState<number | null>(null)
  const [reviewType, setReviewType] = useState('')

  const [orderNumber, setOrderNumber] = useState('')
  const [buyer, setBuyer] = useState('')
  const [recipient, setRecipient] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [bank, setBank] = useState('')
  const [account, setAccount] = useState('')
  const [depositor, setDepositor] = useState('')

  const [images, setImages] = useState<ImageFile[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/keywords').then(r => r.json()).then(setKeywords)
  }, [])

  // 요청자 변경 시 하위 선택 초기화
  useEffect(() => {
    setPlatform('')
    setKeyword('')
    setOption('')
    setProductPrice(null)
    setReviewCost(null)
    setReviewType('')
  }, [requester])

  // 구매처 변경 시 하위 선택 초기화
  useEffect(() => {
    setKeyword('')
    setOption('')
    setProductPrice(null)
    setReviewCost(null)
    setReviewType('')
  }, [platform])

  // 키워드 변경 시 하위 선택 초기화
  useEffect(() => {
    setOption('')
    setProductPrice(null)
    setReviewCost(null)
    setReviewType('')
  }, [keyword])

  // 옵션 선택 시 리뷰 정보 자동 입력
  useEffect(() => {
    const found = keywords.find(
      k => k.requester === requester && k.platform === platform && k.keyword === keyword && k.option === option
    )
    if (found) {
      setProductPrice(found.product_price ?? null)
      setReviewCost(found.review_cost)
      setReviewType(found.review_type)
    } else {
      setProductPrice(null)
      setReviewCost(null)
      setReviewType('')
    }
  }, [option, requester, platform, keyword, keywords])

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) addImage(file)
        }
      }
    }
    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images])

  // 요청자별 연동 목록
  const requesters       = [...new Set(keywords.map(k => k.requester).filter(Boolean))]
  const filteredPlatforms = [...new Set(
    keywords.filter(k => !requester || k.requester === requester).map(k => k.platform)
  )]
  const filteredKeywords = [...new Set(
    keywords.filter(k => (!requester || k.requester === requester) && k.platform === platform).map(k => k.keyword)
  )]
  const filteredOptions  = keywords
    .filter(k => (!requester || k.requester === requester) && k.platform === platform && k.keyword === keyword)
    .map(k => k.option)

  function addImage(file: File) {
    if (images.length >= 2) return
    const preview = URL.createObjectURL(file)
    setImages(prev => [...prev, { file, preview }])
  }

  function removeImage(idx: number) {
    setImages(prev => {
      URL.revokeObjectURL(prev[idx].preview)
      return prev.filter((_, i) => i !== idx)
    })
  }

  async function uploadImage(file: File, folder: string): Promise<string> {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', folder)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const { url } = await res.json()
    return url
  }

  function handleReset() {
    setSuccess(false)
    setRequester(''); setPlatform(''); setKeyword(''); setOption('')
    setProductPrice(null); setReviewCost(null); setReviewType('')
    setOrderNumber(''); setBuyer(''); setRecipient('')
    setPhone(''); setAddress(''); setBank(''); setAccount(''); setDepositor('')
    setImages([])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!platform || !keyword || !option) return alert('구매처, 키워드, 구매옵션을 선택해주세요.')
    if (!depositor) return alert('예금주를 입력해주세요.')

    setSubmitting(true)
    try {
      let image1_url = '', image2_url = ''
      if (images[0]) image1_url = await uploadImage(images[0].file, 'purchase')
      if (images[1]) image2_url = await uploadImage(images[1].file, 'purchase')

      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requester, platform, keyword, option, product_price: productPrice, review_cost: reviewCost,
          order_number: orderNumber, buyer, recipient, phone,
          address, bank, account, depositor, image1_url, image2_url,
        }),
      })
      if (!res.ok) throw new Error('제출 실패')

      setSuccess(true)
    } catch {
      alert('제출 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <GNBHeader />

      <div className="max-w-2xl mx-auto p-4 pb-10">
        {success ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-5">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">구매 신청이 완료되었습니다</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">신청 내역은 관리자에게 전달되었습니다.</p>
            <button
              onClick={handleReset}
              className="px-8 py-3 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-700 transition-colors"
            >
              신규 작성하기
            </button>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 상품 정보 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">상품 정보</h2>

            {/* 요청자 */}
            <div className="flex items-center gap-3">
              <label className="w-20 text-sm text-gray-600 dark:text-gray-400 shrink-0">요청자</label>
              <select
                value={requester}
                onChange={e => setRequester(e.target.value)}
                className="flex-1 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
              >
                <option value="">선택</option>
                {requesters.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* 구매처 */}
            <div className="flex items-center gap-3">
              <label className="w-20 text-sm text-gray-600 dark:text-gray-400 shrink-0">구매처</label>
              <select
                value={platform}
                onChange={e => setPlatform(e.target.value)}
                disabled={!requester}
                className="flex-1 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-gray-700 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-400"
              >
                <option value="">선택</option>
                {filteredPlatforms.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* 키워드 */}
            <div className="flex items-center gap-3">
              <label className="w-20 text-sm text-gray-600 dark:text-gray-400 shrink-0">키워드</label>
              <select
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                disabled={!platform}
                className="flex-1 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-gray-700 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-400"
              >
                <option value="">선택</option>
                {filteredKeywords.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>

            {/* 구매옵션 */}
            <div className="flex items-center gap-3">
              <label className="w-20 text-sm text-gray-600 dark:text-gray-400 shrink-0">구매옵션</label>
              <select
                value={option}
                onChange={e => setOption(e.target.value)}
                disabled={!keyword}
                className="flex-1 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-gray-700 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-400"
              >
                <option value="">선택</option>
                {filteredOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            {option && (productPrice !== null || reviewCost !== null) && (
              <div className="flex items-center gap-3 pt-1 border-t border-gray-100">
                <span className="w-20 text-sm text-gray-600 dark:text-gray-400 shrink-0">상품 정보</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {productPrice !== null && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      상품가 <span className="font-bold text-gray-900 dark:text-white">{productPrice.toLocaleString()}원</span>
                    </span>
                  )}
                  {productPrice !== null && reviewCost !== null && (
                    <span className="text-gray-300">|</span>
                  )}
                  {reviewCost !== null && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      리뷰비용 <span className="font-bold text-gray-900 dark:text-white">{reviewCost.toLocaleString()}원</span>
                    </span>
                  )}
                  {reviewType && (
                    <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded">
                      {reviewType}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 주문 정보 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">주문 정보</h2>

            {([
              { label: '주문번호', value: orderNumber, setter: setOrderNumber, placeholder: '주문번호 입력' },
              { label: '구매자', value: buyer, setter: setBuyer, placeholder: '구매자 이름' },
              { label: '수취인', value: recipient, setter: setRecipient, placeholder: '수취인 이름' },
              { label: '전화번호', value: phone, setter: setPhone, placeholder: '010-0000-0000' },
              { label: '주소', value: address, setter: setAddress, placeholder: '배송 주소' },
              { label: '은행명', value: bank, setter: setBank, placeholder: '은행명' },
              { label: '계좌번호', value: account, setter: setAccount, placeholder: '계좌번호' },
              { label: '예금주', value: depositor, setter: setDepositor, placeholder: '예금주 이름' },
            ] as const).map(({ label, value, setter, placeholder }) => (
              <div key={label} className="flex items-center gap-3">
                <label className="w-20 text-sm text-gray-600 dark:text-gray-400 shrink-0">{label}</label>
                <input
                  type="text"
                  value={value}
                  onChange={e => (setter as (v: string) => void)(e.target.value)}
                  placeholder={placeholder}
                  className="flex-1 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                />
              </div>
            ))}
          </div>

          {/* 이미지 업로드 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <h2 className="text-sm font-bold text-gray-700 mb-1">구매 인증 이미지 <span className="font-normal text-gray-400">(최대 2장)</span></h2>
            <p className="text-xs text-gray-400 mb-3">파일 선택 또는 Ctrl+V 붙여넣기</p>
            <div className="flex gap-3 flex-wrap">
              {images.map((img, i) => (
                <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                  <img src={img.preview} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full text-xs flex items-center justify-center leading-none"
                  >×</button>
                </div>
              ))}
              {images.length < 2 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 hover:border-gray-500 hover:text-gray-600 transition-colors"
                >
                  <span className="text-3xl leading-none">+</span>
                  <span className="text-xs mt-1">추가</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { if (e.target.files?.[0]) addImage(e.target.files[0]); e.target.value = '' }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {submitting ? '제출 중...' : '구매 신청하기'}
          </button>
        </form>
        )}
      </div>
    </div>
  )
}
