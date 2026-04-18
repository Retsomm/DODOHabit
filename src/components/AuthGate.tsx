interface Props {
  onSignIn: () => void
}

const AuthGate = ({ onSignIn }: Props) => (
  <div className="min-h-screen bg-warm-radial flex flex-col items-center justify-center px-8 text-center relative overflow-hidden">
    {/* Energy orb */}
    <div className="relative mb-10 flex items-center justify-center">
      <div className="absolute w-40 h-40 rounded-full bg-terracotta/10 animate-halo blur-2xl" />
      <div className="absolute w-28 h-28 rounded-full border border-champagne/10 animate-halo" />
      <div className="w-20 h-20 rounded-full animate-breathe glow-terracotta relative z-10"
        style={{ background: 'radial-gradient(circle at 35% 35%, #E8C9A3, #D97757 55%, #B8593A)' }}
      />
    </div>

    <h1 className="font-fraunces text-4xl font-light text-cream tracking-tight mb-2">
      DODOHabit
    </h1>
    <p className="text-warm-slate text-sm mb-1 font-mono-jetbrains tracking-widest uppercase">
      Projector · Energy OS
    </p>
    <p className="text-cream-faint text-sm mb-14 font-serif-tc">
      Aria 的投射者能量追蹤工具
    </p>

    <button
      onClick={onSignIn}
      className="flex items-center gap-3 bg-warm-800 border border-warm-strong text-cream px-7 py-4 rounded-2xl font-medium text-sm hover:bg-warm-700 active:scale-95 transition-all glow-terracotta-sm"
    >
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
      使用 Google 帳號登入
    </button>

    <p className="text-cream-faint text-xs mt-10 leading-relaxed max-w-xs font-serif-tc">
      登入後資料自動同步至雲端<br />
      手機與電腦可同時存取
    </p>
  </div>
)

export default AuthGate
