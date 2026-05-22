'use client'

import { useEffect, useState } from 'react'
import AdminNav from '@/components/admin/AdminNav'

type AdminUser = {
  id: number
  username: string
  display_name: string
  role: string
  is_active: boolean
  created_at: string
}

type Me = { id: number; username: string; name: string; role: string }

const EMPTY_FORM = { username: '', display_name: '', password: '', role: 'admin' }

export default function UsersPage() {
  const [me, setMe] = useState<Me | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [pwForm, setPwForm] = useState<{ id: number; value: string } | null>(null)

  async function load() {
    const [meRes, usersRes] = await Promise.all([fetch('/api/admin/me'), fetch('/api/admin/users')])
    if (meRes.ok) setMe(await meRes.json())
    if (usersRes.ok) setUsers(await usersRes.json())
  }

  useEffect(() => { load() }, [])

  async function handleAdd() {
    if (!form.username || !form.password) return alert('아이디와 비밀번호를 입력해주세요.')
    setSaving(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) return alert(data.error)
      setForm(EMPTY_FORM)
      await load()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`"${name}" 계정을 삭제하시겠습니까?`)) return
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    const data = await res.json()
    if (!res.ok) return alert(data.error)
    await load()
  }

  async function handleToggleActive(user: AdminUser) {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, is_active: !user.is_active }),
    })
    await load()
  }

  async function handlePasswordChange() {
    if (!pwForm?.value) return alert('새 비밀번호를 입력해주세요.')
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: pwForm.id, password: pwForm.value }),
    })
    const data = await res.json()
    if (!res.ok) return alert(data.error)
    setPwForm(null)
    alert('비밀번호가 변경되었습니다.')
  }

  const isSuper = me?.role === 'super'
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('ko-KR')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <AdminNav />
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">계정 관리</h1>

        {/* 계정 목록 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">관리자 계정 목록</h2>
            <span className="text-xs text-gray-400 dark:text-gray-500">총 {users.length}명</span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400">
              <tr>
                <th className="text-left px-4 py-2 font-medium">이름</th>
                <th className="text-left px-4 py-2 font-medium">아이디</th>
                <th className="text-center px-4 py-2 font-medium">권한</th>
                <th className="text-center px-4 py-2 font-medium">상태</th>
                <th className="text-center px-4 py-2 font-medium">가입일</th>
                <th className="text-center px-4 py-2 font-medium">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {users.map(u => (
                <tr key={u.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${!u.is_active ? 'opacity-40' : ''}`}>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                    {u.display_name || u.username}
                    {me?.id === u.id && <span className="ml-1.5 text-[10px] px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded font-bold">나</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">{u.username}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 text-[11px] font-bold rounded text-white ${u.role === 'super' ? 'bg-gray-900' : 'bg-gray-400'}`}>
                      {u.role === 'super' ? 'Super' : 'Admin'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {isSuper && me?.id !== u.id ? (
                      <button
                        onClick={() => handleToggleActive(u)}
                        className={`px-2 py-0.5 text-[11px] font-bold rounded text-white transition-colors ${u.is_active ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 hover:bg-gray-500'}`}
                      >
                        {u.is_active ? '활성' : '비활성'}
                      </button>
                    ) : (
                      <span className={`px-2 py-0.5 text-[11px] font-bold rounded text-white ${u.is_active ? 'bg-green-500' : 'bg-gray-400'}`}>
                        {u.is_active ? '활성' : '비활성'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-gray-400 dark:text-gray-500">{fmtDate(u.created_at)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {(isSuper || me?.id === u.id) && (
                        <button
                          onClick={() => setPwForm({ id: u.id, value: '' })}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          비번변경
                        </button>
                      )}
                      {isSuper && me?.id !== u.id && (
                        <button
                          onClick={() => handleDelete(u.id, u.display_name || u.username)}
                          className="text-xs text-red-500 hover:underline font-medium"
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 비밀번호 변경 모달 */}
        {pwForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-sm">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4">비밀번호 변경</h3>
              <input
                type="password"
                placeholder="새 비밀번호"
                value={pwForm.value}
                onChange={e => setPwForm(p => p ? { ...p, value: e.target.value } : p)}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-gray-700 dark:text-gray-100 mb-4"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handlePasswordChange}
                  className="flex-1 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors"
                >
                  변경
                </button>
                <button
                  onClick={() => setPwForm(null)}
                  className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 새 계정 추가 (super만) */}
        {isSuper && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-4">새 계정 추가</h2>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">이름</label>
                <input
                  value={form.display_name}
                  onChange={e => setForm(p => ({ ...p, display_name: e.target.value }))}
                  placeholder="홍길동"
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">아이디 *</label>
                <input
                  value={form.username}
                  onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                  placeholder="hong"
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">비밀번호 *</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="비밀번호"
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">권한</label>
                <select
                  value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="admin">Admin (일반)</option>
                  <option value="super">Super (계정 관리 가능)</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleAdd}
              disabled={saving}
              className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {saving ? '추가 중...' : '계정 추가'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
