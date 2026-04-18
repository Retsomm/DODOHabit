import { useState, useEffect, useRef } from 'react'
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

const OrbFullscreen = ({ onClose }: { onClose: () => void }) => (
  <div
    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-warm-950"
    style={{
      background: `radial-gradient(ellipse at 50% 45%, rgba(217,119,87,0.12) 0%, rgba(217,119,87,0.04) 35%, #0A0807 60%), #0A0807`,
    }}
  >
    {/* Outer ambient glow only — no visible rings */}
    <div className="absolute w-[480px] h-[480px] rounded-full animate-halo"
      style={{ background: 'radial-gradient(circle, rgba(217,119,87,0.08), transparent 65%)', filter: 'blur(48px)' }} />
    <div className="absolute w-60 h-60 rounded-full animate-halo"
      style={{ animationDelay: '1.2s', background: 'radial-gradient(circle, rgba(232,201,163,0.06), transparent 70%)', filter: 'blur(24px)' }} />

    {/* Main orb */}
    <div className="relative flex items-center justify-center">
      <div className="absolute w-48 h-48 rounded-full animate-halo blur-3xl"
        style={{ background: 'rgba(217,119,87,0.2)' }} />
      <div
        className="w-36 h-36 rounded-full animate-breathe relative z-10"
        style={{
          background: 'radial-gradient(circle at 35% 35%, #E8C9A3, #D97757 55%, #B8593A)',
          boxShadow: '0 0 60px rgba(217,119,87,0.5), 0 0 120px rgba(217,119,87,0.2)',
        }}
      />
    </div>

    {/* Label */}
    <div className="mt-16 text-center space-y-2">
      <div className="font-mono-jetbrains text-xs tracking-[0.3em] text-warm-slate/60 uppercase">Energy Orb</div>
      <p className="font-fraunces italic text-cream/40 text-sm">靜靜地呼吸</p>
    </div>

    {/* Close button */}
    <button
      onClick={onClose}
      className="absolute bottom-16 left-1/2 -translate-x-1/2 px-8 py-3 rounded-full border border-warm-strong text-warm-slate text-sm font-serif-tc hover:text-cream hover:border-cream/20 transition-colors"
      style={{ backdropFilter: 'blur(12px)', background: 'rgba(10,8,7,0.6)' }}
    >
      關閉
    </button>
  </div>
)

const Profile = ({ userEmail, profile, saving, onSave, onSignOut }: Props) => {
  const [name, setName] = useState(profile.displayName)
  const [photo, setPhoto] = useState(profile.photoDataUrl)
  const [photoPosition, setPhotoPosition] = useState(profile.photoPosition ?? { x: 50, y: 50 })
  const [repositioning, setRepositioning] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'done'>('idle')
  const [orbOpen, setOrbOpen] = useState(false)
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
    <>
      {orbOpen && <OrbFullscreen onClose={() => setOrbOpen(false)} />}

    <div className="min-h-screen bg-warm-radial px-5 pt-6 pb-32 max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono-jetbrains text-xs tracking-[0.25em] text-warm-slate uppercase mb-[24px]">Account · 帳號設定</div>
           <h1 className="font-fraunces text-3xl font-light text-cream">
            <em className="italic text-terracotta-soft">你</em>的節奏
          </h1>
        </div>

        {/* Orb entry button */}
        <button
          onClick={() => setOrbOpen(true)}
          className="relative flex items-center justify-center w-12 h-12 mt-1 rounded-full group"
          title="能量球冥想"
        >
          <div className="absolute inset-0 rounded-full animate-halo opacity-50 blur-md"
            style={{ background: 'rgba(217,119,87,0.3)' }} />
          <div
            className="w-9 h-9 rounded-full animate-breathe relative z-10 group-hover:scale-110 transition-transform"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #E8C9A3, #D97757 55%, #B8593A)',
              boxShadow: '0 0 16px rgba(217,119,87,0.5)',
            }}
          />
        </button>
      </div>

      {/* Avatar card */}
      <div className="p-5 rounded-2xl border border-warm-strong bg-warm-800/30 flex items-center gap-5">
        {repositioning && photo ? (
          <div className="w-full space-y-4">
            <div
              className={`w-32 h-32 rounded-full overflow-hidden border-2 border-terracotta mx-auto ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <img
                src={photo} alt="avatar"
                className="w-full h-full object-cover select-none pointer-events-none"
                style={{ objectPosition: `${photoPosition.x}% ${photoPosition.y}%` }}
                draggable={false}
              />
            </div>
            <p className="text-center text-xs text-warm-slate font-serif-tc">拖曳調整顯示位置</p>
            <div className="flex gap-3">
              <button onClick={() => fileRef.current?.click()}
                className="flex-1 py-2.5 border border-warm-strong text-warm-slate rounded-xl text-sm hover:text-cream transition-colors font-serif-tc">
                更換照片
              </button>
              <button onClick={() => setRepositioning(false)}
                className="flex-1 py-2.5 bg-terracotta text-ink-deep rounded-xl text-sm font-medium transition-all active:scale-95 font-serif-tc">
                完成
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Avatar orb */}
            <div className="relative w-16 h-16 shrink-0">
              <div className="absolute inset-0 -m-2 rounded-full glow-terracotta opacity-40 blur-md" />
              <button
                onClick={() => photo ? setRepositioning(true) : fileRef.current?.click()}
                className="relative w-16 h-16 rounded-full overflow-hidden border border-terracotta/30 group"
                style={{ background: 'radial-gradient(circle at 35% 35%, #E8C9A3, #D97757 60%, #B8593A)' }}
              >
                {photo ? (
                  <img src={photo} alt="avatar" className="w-full h-full object-cover"
                    style={{ objectPosition: `${photoPosition.x}% ${photoPosition.y}%` }} />
                ) : (
                  <span className="w-full h-full flex items-center justify-center font-fraunces italic text-2xl text-ink-deep">
                    {initial}
                  </span>
                )}
                <div className="absolute inset-0 bg-warm-950/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="white" strokeWidth="1.5" />
                    <path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" stroke="white" strokeWidth="1.5" />
                  </svg>
                </div>
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-fraunces text-xl text-cream">{name || 'Aria'}</div>
              <div className="font-mono-jetbrains text-xs tracking-wider text-warm-slate mt-0.5 truncate">{userEmail}</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#8FA683]" style={{ boxShadow: '0 0 6px #8FA683' }} />
                <span className="font-mono-jetbrains text-xs tracking-widest text-warm-slate uppercase">已同步</span>
              </div>
            </div>
          </>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />

      {/* Settings */}
      <div className="rounded-2xl border border-warm-strong bg-warm-800/20 overflow-hidden divide-y divide-warm-strong">
        {/* Display name */}
        <div className="p-4">
          <div className="font-mono-jetbrains text-xs tracking-[0.2em] text-warm-slate uppercase mb-2">Display Name</div>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="輸入你的名字..."
            className="w-full bg-transparent border-none text-cream text-base placeholder-warm-slate/50 focus:outline-none font-serif-tc"
          />
        </div>

        {/* Email */}
        <div className="p-4">
          <div className="font-mono-jetbrains text-xs tracking-[0.2em] text-warm-slate uppercase mb-2">Email</div>
          <div className="text-cream/60 text-sm font-serif-tc">{userEmail}</div>
        </div>

        {/* Photo upload */}
        <button onClick={() => fileRef.current?.click()}
          className="w-full p-4 flex items-center justify-between hover:bg-warm-700/20 transition-colors">
          <div>
            <div className="font-serif-tc text-sm text-cream text-left">更換頭像照片</div>
            <div className="font-serif-tc text-xs text-warm-slate">點擊上傳並裁切</div>
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="rgba(245,237,226,0.3)" strokeWidth="2" />
          </svg>
        </button>
      </div>

      {/* Quote */}
      <div className="p-4 rounded-2xl border border-champagne/10 bg-champagne/5">
        <p className="font-fraunces italic text-sm text-cream/75 leading-relaxed">
          「苦澀是訊號，不是能力不足。」
        </p>
        <div className="font-mono-jetbrains text-xs tracking-[0.2em] text-warm-slate mt-2 uppercase">
          — Human Design · Projector
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className={`w-full py-4 rounded-2xl font-medium text-sm font-serif-tc transition-all active:scale-95 flex items-center justify-center gap-2 ${
          saveStatus === 'done'
            ? 'bg-[#8FA683]/20 text-[#8FA683] border border-[#8FA683]/30'
            : saving
            ? 'bg-terracotta/40 text-ink-deep cursor-not-allowed'
            : 'bg-terracotta hover:bg-terracotta-soft text-ink-deep'
        }`}
      >
        {saveStatus === 'done' ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            儲存成功
          </>
        ) : saving ? (
          <>
            <div className="w-4 h-4 border-2 border-ink-deep border-t-transparent rounded-full animate-spin" />
            儲存中
          </>
        ) : '儲存設定'}
      </button>

      {/* Sign out */}
      <button
        onClick={onSignOut}
        className="w-full py-4 rounded-2xl text-sm border border-[rgba(199,123,123,0.25)] text-[#C77B7B] hover:bg-[rgba(199,123,123,0.08)] transition-colors flex items-center justify-center gap-2 font-serif-tc"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        登出帳號
      </button>

      <div className="text-center font-mono-jetbrains text-xs tracking-[0.2em] text-warm-slate/40 uppercase">
        DODOHABIT · 2026
      </div>
    </div>
    </>
  )
}

export default Profile
