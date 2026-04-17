import { useState, useEffect, useRef } from 'react'
import { Camera, Save, Check, Loader2, LogOut } from 'lucide-react'
import { UserProfile } from '../hooks/useProfile'

interface Props {
  userEmail: string | null
  profile: UserProfile
  saving: boolean
  onSave: (next: Partial<UserProfile>) => Promise<void>
  onSignOut: () => void
}

const compressImage = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const max = 240
      const ratio = Math.min(max / img.width, max / img.height, 1)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * ratio)
      canvas.height = Math.round(img.height * ratio)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.75))
    }
    img.onerror = reject
    img.src = url
  })

const Profile = ({ userEmail, profile, saving, onSave, onSignOut }: Props) => {
  const [name, setName] = useState(profile.displayName)
  const [photo, setPhoto] = useState(profile.photoDataUrl)
  const [photoPosition, setPhotoPosition] = useState(profile.photoPosition ?? { x: 50, y: 50 })
  const [repositioning, setRepositioning] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'done'>('idle')
  const fileRef = useRef<HTMLInputElement>(null)
  const dragStartRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    setName(profile.displayName)
    setPhoto(profile.photoDataUrl)
    setPhotoPosition(profile.photoPosition ?? { x: 50, y: 50 })
  }, [profile.displayName, profile.photoDataUrl, profile.photoPosition])

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await compressImage(file)
    setPhoto(compressed)
    setRepositioning(true)
    e.target.value = ''
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true)
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    setPhotoPosition(prev => ({
      x: Math.max(0, Math.min(100, prev.x - dx * 0.5)),
      y: Math.max(0, Math.min(100, prev.y - dy * 0.5)),
    }))
  }

  const handlePointerUp = () => setIsDragging(false)

  const handleSave = async () => {
    await onSave({ displayName: name, photoDataUrl: photo, photoPosition })
    setSaveStatus('done')
    setTimeout(() => setSaveStatus('idle'), 2000)
  }

  const initial = (name || userEmail || 'A')[0].toUpperCase()

  return (
    <div className="px-4 pt-5 pb-28 max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">帳號設定</h1>

      {/* 頭像 */}
      <div className="flex flex-col items-center gap-3 py-2">
        {repositioning && photo ? (
          <>
            <div
              className={`w-40 h-40 rounded-full overflow-hidden border-2 border-violet-400 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <img
                src={photo}
                alt="avatar"
                className="w-full h-full object-cover select-none pointer-events-none"
                style={{ objectPosition: `${photoPosition.x}% ${photoPosition.y}%` }}
                draggable={false}
              />
            </div>
            <p className="text-sm text-gray-400 dark:text-slate-500">拖曳調整顯示位置</p>
            <div className="flex gap-3">
              <button
                onClick={() => fileRef.current?.click()}
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-space-800 transition-colors"
              >
                更換照片
              </button>
              <button
                onClick={() => setRepositioning(false)}
                className="px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-medium transition-colors"
              >
                完成
              </button>
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => photo ? setRepositioning(true) : fileRef.current?.click()}
              className="relative w-24 h-24 rounded-full overflow-hidden bg-violet-100 dark:bg-violet-900 border-2 border-violet-300 dark:border-violet-700 group"
            >
              {photo ? (
                <img
                  src={photo}
                  alt="avatar"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: `${photoPosition.x}% ${photoPosition.y}%` }}
                />
              ) : (
                <span className="w-full h-full flex items-center justify-center text-3xl font-bold text-violet-600 dark:text-violet-300">
                  {initial}
                </span>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </button>
            <p className="text-sm text-gray-400 dark:text-slate-500">
              {photo ? '點擊調整位置' : '點擊上傳頭像'}
            </p>
            {photo && (
              <button
                onClick={() => fileRef.current?.click()}
                className="text-xs text-violet-500 dark:text-violet-400 hover:underline"
              >
                更換照片
              </button>
            )}
          </>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
      </div>

      {/* 欄位 */}
      <div className="bg-white dark:bg-space-800 rounded-2xl p-5 space-y-5 border border-gray-200 dark:border-slate-700/50">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-500 dark:text-slate-400">電子郵件</label>
          <p className="text-base text-gray-900 dark:text-slate-100">{userEmail}</p>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-500 dark:text-slate-400">顯示名稱</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="輸入你的名字..."
            className="w-full bg-gray-50 dark:bg-space-950 border border-gray-300 dark:border-slate-600/60 rounded-xl px-3.5 py-2.5 text-base text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>
      </div>

      {/* 儲存 */}
      <button
        onClick={handleSave}
        disabled={saving}
        className={`w-full py-4 rounded-2xl font-semibold text-base transition-all active:scale-95 flex items-center justify-center gap-2 ${
          saveStatus === 'done'
            ? 'bg-emerald-500 dark:bg-emerald-600 text-white'
            : saving
            ? 'bg-violet-400 dark:bg-violet-800 text-white cursor-not-allowed'
            : 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-200 dark:shadow-violet-900/40'
        }`}
      >
        {saveStatus === 'done'
          ? <><Check className="w-5 h-5" />儲存成功</>
          : saving
          ? <><Loader2 className="w-5 h-5 animate-spin" />儲存中</>
          : <><Save className="w-5 h-5" />儲存設定</>
        }
      </button>

      {/* 登出 */}
      <button
        onClick={onSignOut}
        className="w-full py-4 rounded-2xl font-semibold text-base border border-red-200 dark:border-red-900/50 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
      >
        <LogOut className="w-5 h-5" />
        登出帳號
      </button>
    </div>
  )
}

export default Profile
