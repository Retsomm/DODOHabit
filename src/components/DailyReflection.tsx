import { useState, useEffect } from 'react'
import { DailyEntry, BitternessSource } from '../types'
import { todayStr, formatDisplay } from '../utils/dateUtils'

interface Props {
  viewDate: string
  existingEntry?: DailyEntry
  onSave: (entry: DailyEntry) => void
  onBack?: () => void
}

type Step = 'energy' | 'bitterness' | 'splenic' | 'notes' | 'dikw' | 'complete'
const STEPS: Step[] = ['energy', 'bitterness', 'splenic', 'notes', 'dikw', 'complete']
const DATA_STEPS = STEPS.slice(0, -1)

const makeDefault = (date: string): DailyEntry => ({
  id: crypto.randomUUID(),
  date,
  successScore: 5,
  bitternessScore: 3,
  successMoment: '',
  bitternessSource: 'none',
  emotionalState: '',
  splenic: { hadIntuition: false, description: '', trusted: false, outcome: '' },
  investigation: { topic: '', findings: '' },
  experiment: { whatFailed: '', dataLearned: '' },
  dikw: {
    situation: '', task: '', action: '', result: '',
    controllable: '', uncontrollable: '', wisdomAction: '',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

const BITTERNESS_OPTS: { value: BitternessSource; label: string; symbol: string }[] = [
  { value: 'self-initiated', label: '主動發起', symbol: '⚡' },
  { value: 'over-working', label: '過度勞動', symbol: '🔥' },
  { value: 'both', label: '兩者都有', symbol: '⚠' },
  { value: 'none', label: '沒有苦澀', symbol: '✦' },
]

const netEnergyColor = (net: number) => {
  if (net >= 5) return 'text-[#F5E6C8]'
  if (net >= 2) return 'text-champagne'
  if (net >= -1) return 'text-terracotta'
  if (net >= -5) return 'text-terracotta-deep'
  return 'text-[#7A3B2A]'
}

const netEnergyLabel = (net: number) => {
  if (net >= 5) return '能量充沛'
  if (net >= 2) return '狀態不錯'
  if (net >= -1) return '能量平衡'
  if (net >= -5) return '注意苦澀'
  return '需要休息'
}

const WarmTextarea = ({
  value, onChange, placeholder, rows = 3,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number
}) => (
  <textarea
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
    className="w-full bg-warm-800/60 border border-warm-strong rounded-xl px-4 py-3 text-sm text-cream placeholder-warm-slate/60 focus:outline-none focus:border-terracotta/50 resize-none transition-colors font-serif-tc leading-relaxed"
  />
)

const StepLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="font-mono-jetbrains text-xs tracking-[0.28em] text-warm-slate uppercase mb-3">{children}</div>
)

const StepTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="font-fraunces text-4xl font-light text-cream leading-snug mb-2">{children}</h2>
)

const DailyReflection = ({ viewDate, existingEntry, onSave, onBack }: Props) => {
  const [entry, setEntry] = useState<DailyEntry>(existingEntry ?? makeDefault(viewDate))
  const [step, setStep] = useState<Step>(() => existingEntry ? 'complete' : 'energy')
  const [saveStatus, setSaveStatus] = useState<'unsaved' | 'saving' | 'saved'>(existingEntry ? 'saved' : 'unsaved')
  const isToday = viewDate === todayStr()

  useEffect(() => {
    setEntry(existingEntry ?? makeDefault(viewDate))
    setSaveStatus(existingEntry ? 'saved' : 'unsaved')
    setStep(existingEntry ? 'complete' : 'energy')
  }, [existingEntry, viewDate])

  const up = (partial: Partial<DailyEntry>) => {
    setEntry(prev => ({ ...prev, ...partial, updatedAt: new Date().toISOString() }))
    setSaveStatus('unsaved')
  }

  const stepIndex = STEPS.indexOf(step)
  const goNext = () => {
    const next = STEPS[stepIndex + 1]
    if (next) setStep(next)
  }
  const goPrev = () => {
    const prev = STEPS[stepIndex - 1]
    if (prev) setStep(prev)
  }

  const handleSave = () => {
    setSaveStatus('saving')
    onSave(entry)
    setTimeout(() => setSaveStatus('saved'), 600)
  }

  const net = entry.successScore - entry.bitternessScore

  return (
    <div className="h-full bg-warm-radial-top flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-7 pb-3 shrink-0"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.75rem)' }}>
        <div className="flex items-center gap-3">
          {(onBack && step === 'energy') && (
            <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-full border border-warm-strong text-warm-slate hover:text-cream transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}
          {step !== 'energy' && (
            <button onClick={goPrev} className="w-8 h-8 flex items-center justify-center rounded-full border border-warm-strong text-warm-slate hover:text-cream transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}
          <div>
            <div className="font-mono-jetbrains text-xs tracking-widest text-warm-slate uppercase">
              {isToday ? 'TODAY · 今日復盤' : `ARCHIVE · ${formatDisplay(viewDate)}`}
            </div>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {DATA_STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => setStep(s)}
              className={`transition-all rounded-full ${
                s === step
                  ? 'w-5 h-1.5 bg-terracotta'
                  : stepIndex > i
                  ? 'w-1.5 h-1.5 bg-terracotta/40'
                  : 'w-1.5 h-1.5 bg-warm-700'
              }`}
            />
          ))}
          <button
            onClick={() => setStep('complete')}
            className={`transition-all rounded-full ${
              step === 'complete'
                ? 'w-5 h-1.5 bg-champagne'
                : saveStatus === 'saved'
                ? 'w-1.5 h-1.5 bg-champagne/40'
                : 'w-1.5 h-1.5 bg-warm-700'
            }`}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-7 pb-6 animate-slide-up" key={step}>
        {step === 'energy' && (
          <div className="max-w-lg mx-auto pt-10 space-y-10">
            <div>
              <StepLabel>ENERGY · 能量場覺察</StepLabel>
              <StepTitle>今天的<em className="italic text-terracotta-soft"> 能量 </em>如何？</StepTitle>
            </div>

            {/* Energy orb preview */}
            <div className="flex justify-center py-4">
              <div className="relative flex items-center justify-center">
                <div className={`absolute w-32 h-32 rounded-full opacity-20 blur-2xl transition-all duration-700 ${
                  net >= 3 ? 'bg-[#F5E6C8]' : net >= 0 ? 'bg-terracotta' : 'bg-terracotta-deep'
                }`} />
                <div className={`w-20 h-20 rounded-full flex items-center justify-center font-fraunces text-2xl font-light transition-all duration-500 ${netEnergyColor(net)}`}
                  style={{ background: 'radial-gradient(circle at 35% 35%, rgba(232,201,163,0.15), rgba(217,119,87,0.08))' }}
                >
                  {net > 0 ? `+${net}` : net}
                </div>
              </div>
            </div>

            {/* Success slider */}
            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-cream/70 font-serif-tc">成功感</span>
                <span className="font-fraunces text-4xl font-light text-terracotta-soft">{entry.successScore}</span>
              </div>
              <input
                type="range" min={0} max={10} step={1}
                value={entry.successScore}
                onChange={e => up({ successScore: Number(e.target.value) })}
                className="slider-terracotta w-full"
              />
              <div className="flex justify-between font-mono-jetbrains text-xs text-warm-slate tracking-widest">
                <span>0</span><span>5</span><span>10</span>
              </div>
            </div>

            {/* Bitterness slider */}
            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-cream/70 font-serif-tc">苦澀感</span>
                <span className="font-fraunces text-4xl font-light text-champagne">{entry.bitternessScore}</span>
              </div>
              <input
                type="range" min={0} max={10} step={1}
                value={entry.bitternessScore}
                onChange={e => up({ bitternessScore: Number(e.target.value) })}
                className="slider-terracotta w-full"
              />
              <div className="flex justify-between font-mono-jetbrains text-xs text-warm-slate tracking-widest">
                <span>0</span><span>5</span><span>10</span>
              </div>
            </div>

            <div className={`text-center font-mono-jetbrains text-sm tracking-[0.2em] uppercase transition-colors ${netEnergyColor(net)}`}>
              {netEnergyLabel(net)}
            </div>
          </div>
        )}

        {step === 'bitterness' && (
          <div className="max-w-lg mx-auto pt-10 space-y-10">
            <div>
              <StepLabel>BITTERNESS · 苦澀來源</StepLabel>
              <StepTitle>苦澀感<em className="italic text-terracotta-soft"> 來自哪裡？</em></StepTitle>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {BITTERNESS_OPTS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => up({ bitternessSource: opt.value })}
                  className={`py-5 rounded-2xl text-sm font-medium transition-all border flex flex-col items-center gap-2 ${
                    entry.bitternessSource === opt.value
                      ? 'border-terracotta bg-terracotta/10 text-cream'
                      : 'border-warm-strong bg-warm-800/40 text-warm-slate hover:border-terracotta/40 hover:text-cream/70'
                  }`}
                >
                  <span className="text-2xl">{opt.symbol}</span>
                  <span className="font-serif-tc">{opt.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <label className="text-sm text-cream/70 font-serif-tc block">
                我被正確邀請的那一刻是？
              </label>
              <WarmTextarea
                value={entry.successMoment}
                onChange={v => up({ successMoment: v })}
                placeholder="描述那個被看見、被認可的瞬間..."
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm text-cream/70 font-serif-tc block">當下情緒狀態</label>
              <WarmTextarea
                value={entry.emotionalState}
                onChange={v => up({ emotionalState: v })}
                placeholder="用幾個詞描述現在的情緒..."
                rows={2}
              />
            </div>
          </div>
        )}

        {step === 'splenic' && (
          <div className="max-w-lg mx-auto pt-10 space-y-10">
            <div>
              <StepLabel>SPLENIC · 脾臟直覺</StepLabel>
              <StepTitle>今天有<em className="italic text-terracotta-soft"> 第一秒直覺 </em>嗎？</StepTitle>
              <p className="text-sm text-warm-slate font-serif-tc mt-2 leading-relaxed">
                脾臟直覺只在當下出現一次，信任它，不要讓大腦覆蓋。
              </p>
            </div>

            {/* Had intuition toggle */}
            <div className="flex gap-3">
              {[{ v: true, l: '有，有直覺' }, { v: false, l: '今天沒有' }].map(opt => (
                <button
                  key={String(opt.v)}
                  onClick={() => up({ splenic: { ...entry.splenic, hadIntuition: opt.v } })}
                  className={`flex-1 py-4 rounded-2xl text-sm font-medium transition-all border font-serif-tc ${
                    entry.splenic.hadIntuition === opt.v
                      ? 'border-terracotta bg-terracotta/10 text-cream'
                      : 'border-warm-strong bg-warm-800/40 text-warm-slate'
                  }`}
                >
                  {opt.l}
                </button>
              ))}
            </div>

            {entry.splenic.hadIntuition && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-3">
                  <label className="text-sm text-cream/70 font-serif-tc block">那個直覺的內容是什麼？</label>
                  <WarmTextarea
                    value={entry.splenic.description}
                    onChange={v => up({ splenic: { ...entry.splenic, description: v } })}
                    placeholder="那個第一秒閃過的感知是什麼？"
                  />
                </div>

                <div className="flex gap-3">
                  {[{ v: true, l: '信任了' }, { v: false, l: '大腦壓過了' }].map(opt => (
                    <button
                      key={String(opt.v)}
                      onClick={() => up({ splenic: { ...entry.splenic, trusted: opt.v } })}
                      className={`flex-1 py-4 rounded-2xl text-sm font-medium transition-all border font-serif-tc ${
                        entry.splenic.trusted === opt.v
                          ? 'border-champagne/60 bg-champagne/10 text-cream'
                          : 'border-warm-strong bg-warm-800/40 text-warm-slate'
                      }`}
                    >
                      {opt.l}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  <label className="text-sm text-cream/70 font-serif-tc block">後來的結果是？</label>
                  <WarmTextarea
                    value={entry.splenic.outcome}
                    onChange={v => up({ splenic: { ...entry.splenic, outcome: v } })}
                    placeholder="信任或不信任直覺之後，發生了什麼？"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'notes' && (
          <div className="max-w-lg mx-auto pt-10 space-y-10">
            <div>
              <StepLabel>1 / 3 · 調查與實驗</StepLabel>
              <StepTitle><em className="italic text-terracotta-soft">深研</em>了什麼？<br />搞砸了什麼？</StepTitle>
            </div>

            <div className="space-y-4 p-4 rounded-2xl border border-warm-strong bg-warm-800/30">
              <div className="font-mono-jetbrains text-xs tracking-widest text-champagne/70 uppercase">1 爻 · 調查</div>
              <div className="space-y-3">
                <label className="text-sm text-cream/70 font-serif-tc block">今天深研的主題</label>
                <WarmTextarea
                  value={entry.investigation.topic}
                  onChange={v => up({ investigation: { ...entry.investigation, topic: v } })}
                  placeholder="針對哪個主題進行了深度鑽研？"
                  rows={2}
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm text-cream/70 font-serif-tc block">調查發現</label>
                <WarmTextarea
                  value={entry.investigation.findings}
                  onChange={v => up({ investigation: { ...entry.investigation, findings: v } })}
                  placeholder="掌握了什麼基礎事實或原則？"
                />
              </div>
            </div>

            <div className="space-y-4 p-4 rounded-2xl border border-warm-strong bg-warm-800/30">
              <div className="font-mono-jetbrains text-xs tracking-widest text-terracotta-soft/70 uppercase">3 爻 · 實驗</div>
              <div className="space-y-3">
                <label className="text-sm text-cream/70 font-serif-tc block">今天搞砸或不如預期的事</label>
                <WarmTextarea
                  value={entry.experiment.whatFailed}
                  onChange={v => up({ experiment: { ...entry.experiment, whatFailed: v } })}
                  placeholder="哪裡出錯了？發生了什麼？"
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm text-cream/70 font-serif-tc block">這個「失敗」提供的數據資產</label>
                <WarmTextarea
                  value={entry.experiment.dataLearned}
                  onChange={v => up({ experiment: { ...entry.experiment, dataLearned: v } })}
                  placeholder="它不是失敗，是資產。它告訴我..."
                />
              </div>
            </div>
          </div>
        )}

        {step === 'dikw' && (
          <div className="max-w-lg mx-auto pt-10 space-y-10">
            <div>
              <StepLabel>DIKW · 復盤轉化</StepLabel>
              <StepTitle>今日最重要的<em className="italic text-terracotta-soft"> 一件事</em></StepTitle>
            </div>

            {/* STAR 2x2 */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'situation' as const, label: 'S · 情境', placeholder: '背景是什麼？' },
                { key: 'task' as const, label: 'T · 任務', placeholder: '我的目標是？' },
                { key: 'action' as const, label: 'A · 行動', placeholder: '我做了什麼？' },
                { key: 'result' as const, label: 'R · 結果', placeholder: '發生了什麼？' },
              ].map(f => (
                <div key={f.key} className="space-y-2">
                  <div className="font-mono-jetbrains text-xs tracking-widest text-champagne/60 uppercase">{f.label}</div>
                  <WarmTextarea
                    value={entry.dikw[f.key]}
                    onChange={v => up({ dikw: { ...entry.dikw, [f.key]: v } })}
                    placeholder={f.placeholder}
                    rows={3}
                  />
                </div>
              ))}
            </div>

            <div className="h-px bg-warm-700" />

            <div className="space-y-4">
              {[
                { key: 'controllable' as const, label: '可控的', placeholder: '哪些在我的掌控之內？' },
                { key: 'uncontrollable' as const, label: '不可控的', placeholder: '哪些不在我掌控之內？（放下它）' },
                { key: 'wisdomAction' as const, label: '脾臟給的明日行動', placeholder: '如果明天再來一次，第一秒直覺告訴我...' },
              ].map(f => (
                <div key={f.key} className="space-y-2">
                  <label className="text-sm text-cream/70 font-serif-tc block">{f.label}</label>
                  <WarmTextarea
                    value={entry.dikw[f.key]}
                    onChange={v => up({ dikw: { ...entry.dikw, [f.key]: v } })}
                    placeholder={f.placeholder}
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="max-w-lg mx-auto pt-6 space-y-6 animate-fade-in">
            <div>
              <StepLabel>COMPLETE · 今日復盤</StepLabel>
              <StepTitle>
                {saveStatus === 'saved' ? (
                  <><em className="italic text-terracotta-soft">記錄</em>完成</>
                ) : (
                  <>準備<em className="italic text-terracotta-soft"> 儲存</em></>
                )}
              </StepTitle>
              <p className="text-sm text-warm-slate font-serif-tc mt-1">{formatDisplay(viewDate)}</p>
            </div>

            {/* Summary card */}
            <div className="p-5 rounded-2xl border border-warm-strong bg-warm-800/40 space-y-5">
              {/* Energy */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-mono-jetbrains text-xs tracking-widest text-warm-slate uppercase">能量場</div>
                  <div className="flex items-baseline gap-3">
                    <span className="font-fraunces text-3xl font-light text-terracotta-soft">{entry.successScore}</span>
                    <span className="text-warm-slate text-sm font-serif-tc">成功</span>
                    <span className="font-fraunces text-3xl font-light text-champagne">{entry.bitternessScore}</span>
                    <span className="text-warm-slate text-sm font-serif-tc">苦澀</span>
                  </div>
                </div>
                <div className={`font-mono-jetbrains text-sm tracking-wider ${netEnergyColor(net)}`}>
                  {net > 0 ? `+${net}` : net}
                </div>
              </div>

              {entry.successMoment && (
                <div className="pt-4 border-t border-warm-700">
                  <div className="font-mono-jetbrains text-xs tracking-widest text-warm-slate uppercase mb-2">成功感瞬間</div>
                  <p className="text-sm font-serif-tc text-cream/80 leading-relaxed italic">{entry.successMoment}</p>
                </div>
              )}

              {entry.dikw.wisdomAction && (
                <div className="pt-4 border-t border-warm-700">
                  <div className="font-mono-jetbrains text-xs tracking-widest text-champagne/60 uppercase mb-2">明日行動</div>
                  <p className="text-sm font-serif-tc text-champagne/80 leading-relaxed">{entry.dikw.wisdomAction}</p>
                </div>
              )}

              {entry.splenic.hadIntuition && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-champagne/20 bg-champagne/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-champagne glow-champagne" />
                  <span className="font-mono-jetbrains text-xs tracking-widest text-champagne/70 uppercase">Splenic Intuition</span>
                </div>
              )}
            </div>

            {/* Edit prompt */}
            <button
              onClick={() => setStep('energy')}
              className="w-full py-3 rounded-xl border border-warm-strong text-warm-slate text-sm hover:text-cream hover:border-cream/20 transition-colors font-serif-tc"
            >
              重新編輯
            </button>

            {/* Insight */}
            <div className="p-4 rounded-2xl border border-champagne/10 bg-champagne/5">
              <p className="font-serif-tc text-sm text-cream/80 leading-relaxed italic">
                苦澀是<span className="text-terracotta-soft not-italic">主動發起</span>的訊號，不是能力不足。
              </p>
              <div className="font-mono-jetbrains text-xs tracking-widest text-warm-slate mt-2 uppercase">— Human Design · Projector</div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <div className="shrink-0 px-6"
        style={{ background: 'rgba(10,8,7,0.9)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(232,201,163,0.08)' }}
      >
        <div className="max-w-lg mx-auto py-4">
          {step !== 'complete' ? (
            <button
              onClick={goNext}
              className="w-full py-4 rounded-2xl bg-terracotta hover:bg-terracotta-soft text-ink-deep font-medium text-sm font-serif-tc transition-all active:scale-95"
            >
              下一步
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saveStatus === 'saving' || saveStatus === 'saved'}
              className={`w-full py-4 rounded-2xl font-medium text-sm font-serif-tc transition-all active:scale-95 flex items-center justify-center gap-2 ${
                saveStatus === 'saved'
                  ? 'bg-warm-700 text-champagne/60 cursor-default'
                  : saveStatus === 'saving'
                  ? 'bg-terracotta/60 text-ink-deep cursor-not-allowed'
                  : 'bg-terracotta hover:bg-terracotta-soft text-ink-deep'
              }`}
            >
              {saveStatus === 'saved' ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  已儲存
                </>
              ) : saveStatus === 'saving' ? (
                <>
                  <div className="w-4 h-4 border-2 border-ink-deep border-t-transparent rounded-full animate-spin" />
                  儲存中
                </>
              ) : (
                '儲存今日復盤'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default DailyReflection
