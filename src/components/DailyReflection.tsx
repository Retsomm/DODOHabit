import { useState, useEffect } from 'react'
import { DailyEntry, BitternessSource } from '../types'
import { todayStr, formatDisplay } from '../utils/dateUtils'

interface Props {
  viewDate: string
  existingEntry?: DailyEntry
  onSave: (entry: DailyEntry) => void
  onBack?: () => void
}

const makeDefault = (date: string): DailyEntry => ({
  id: crypto.randomUUID(),
  date,
  successScore: 3,
  bitternessScore: 3,
  successMoment: '',
  bitternessSource: 'none',
  emotionalState: '',
  splenic: { hadIntuition: false, description: '', trusted: false, outcome: '' },
  investigation: { topic: '', findings: '' },
  experiment: { whatFailed: '', dataLearned: '' },
  dikw: {
    situation: '', task: '', action: '', result: '',
    controllable: '', uncontrollable: '', wisdomAction: ''
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

const ScoreBtn = ({
  value,
  selected,
  color,
  onClick,
}: {
  value: number
  selected: boolean
  color: 'violet' | 'amber'
  onClick: () => void
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-9 h-9 rounded-full font-bold text-sm transition-all border-2 ${
      selected
        ? color === 'violet'
          ? 'bg-violet-600 border-violet-400 text-white scale-110 shadow-lg shadow-violet-900/50'
          : 'bg-amber-600 border-amber-400 text-white scale-110 shadow-lg shadow-amber-900/50'
        : 'bg-space-950 border-slate-700 text-slate-500 hover:border-slate-500'
    }`}
  >
    {value}
  </button>
)

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-space-800 rounded-2xl p-5 space-y-4 border border-slate-800/60">
    <h3 className="text-xs font-semibold text-violet-400 uppercase tracking-widest">{title}</h3>
    {children}
  </div>
)

const Field = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 2,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) => (
  <div className="space-y-1.5">
    <label className="text-sm text-slate-400">{label}</label>
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-space-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:border-violet-500/70 resize-none transition-colors"
    />
  </div>
)

const BITTERNESS_OPTS: { value: BitternessSource; label: string }[] = [
  { value: 'self-initiated', label: '主動發起' },
  { value: 'over-working', label: '過度勞動' },
  { value: 'both', label: '兩者都有' },
  { value: 'none', label: '沒有苦澀 ✓' },
]

const DailyReflection = ({ viewDate, existingEntry, onSave, onBack }: Props) => {
  const [entry, setEntry] = useState<DailyEntry>(existingEntry ?? makeDefault(viewDate))
  const [saved, setSaved] = useState(false)
  const isToday = viewDate === todayStr()

  useEffect(() => {
    setEntry(existingEntry ?? makeDefault(viewDate))
    setSaved(false)
  }, [existingEntry, viewDate])

  const up = (partial: Partial<DailyEntry>) =>
    setEntry(prev => ({ ...prev, ...partial, updatedAt: new Date().toISOString() }))

  const energyScore = entry.successScore - entry.bitternessScore
  const energyLabel =
    energyScore >= 3 ? '🌟 能量充沛'
    : energyScore >= 1 ? '💚 狀態不錯'
    : energyScore === 0 ? '⚖️ 能量平衡'
    : energyScore >= -2 ? '⚠️ 注意苦澀'
    : '🔴 需要休息'
  const energyColor =
    energyScore >= 3 ? 'text-emerald-400'
    : energyScore >= 1 ? 'text-teal-400'
    : energyScore === 0 ? 'text-blue-400'
    : energyScore >= -2 ? 'text-amber-400'
    : 'text-red-400'

  const handleSave = () => {
    onSave(entry)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="px-4 pt-5 pb-28 max-w-lg mx-auto space-y-4">
      {!isToday && onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors -mb-1"
        >
          <span>←</span> 返回歷史記錄
        </button>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">
            {isToday ? '今日復盤' : '過去記錄'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {formatDisplay(viewDate)}
            {!isToday && <span className="text-amber-600 text-xs ml-2">（編輯模式）</span>}
          </p>
        </div>
        <span className={`text-sm font-medium mt-1 ${energyColor}`}>{energyLabel}</span>
      </div>

      {/* ⚡ 能量場覺察 */}
      <Card title="⚡ 能量場覺察">
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm text-slate-400">成功感</label>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map(v => (
                <ScoreBtn
                  key={v}
                  value={v}
                  selected={entry.successScore === v}
                  color="violet"
                  onClick={() => up({ successScore: v })}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-400">苦澀感</label>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map(v => (
                <ScoreBtn
                  key={v}
                  value={v}
                  selected={entry.bitternessScore === v}
                  color="amber"
                  onClick={() => up({ bitternessScore: v })}
                />
              ))}
            </div>
          </div>
        </div>

        <Field
          label="成功感瞬間 — 我被正確邀請的那一刻是？"
          value={entry.successMoment}
          onChange={v => up({ successMoment: v })}
          placeholder="描述那個被看見、被認可的瞬間..."
        />

        <div className="space-y-2">
          <label className="text-sm text-slate-400">苦澀來自於？</label>
          <div className="grid grid-cols-2 gap-2">
            {BITTERNESS_OPTS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => up({ bitternessSource: opt.value })}
                className={`py-2 px-3 rounded-xl text-sm font-medium transition-all border ${
                  entry.bitternessSource === opt.value
                    ? 'bg-amber-900/40 border-amber-600/70 text-amber-300'
                    : 'bg-space-950 border-slate-700/80 text-slate-500 hover:border-slate-500'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <Field
          label="當下情緒狀態"
          value={entry.emotionalState}
          onChange={v => up({ emotionalState: v })}
          placeholder="用幾個詞描述現在的情緒..."
          rows={1}
        />
      </Card>

      {/* 🔮 脾臟直覺 */}
      <Card title="🔮 脾臟直覺回顧">
        <div className="space-y-2">
          <label className="text-sm text-slate-400">今天有出現第一秒直覺嗎？</label>
          <div className="flex gap-2">
            {[
              { v: true, l: '有' },
              { v: false, l: '沒有' },
            ].map(opt => (
              <button
                key={String(opt.v)}
                type="button"
                onClick={() => up({ splenic: { ...entry.splenic, hadIntuition: opt.v } })}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  entry.splenic.hadIntuition === opt.v
                    ? 'bg-violet-900/40 border-violet-500/70 text-violet-300'
                    : 'bg-space-950 border-slate-700/80 text-slate-500 hover:border-slate-500'
                }`}
              >
                {opt.l}
              </button>
            ))}
          </div>
        </div>

        {entry.splenic.hadIntuition && (
          <>
            <Field
              label="直覺的內容是什麼？"
              value={entry.splenic.description}
              onChange={v => up({ splenic: { ...entry.splenic, description: v } })}
              placeholder="那個第一秒閃過的感知是什麼？"
            />
            <div className="space-y-2">
              <label className="text-sm text-slate-400">我選擇信任它嗎？</label>
              <div className="flex gap-2">
                {[
                  { v: true, l: '信任了' },
                  { v: false, l: '大腦壓過了' },
                ].map(opt => (
                  <button
                    key={String(opt.v)}
                    type="button"
                    onClick={() => up({ splenic: { ...entry.splenic, trusted: opt.v } })}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                      entry.splenic.trusted === opt.v
                        ? 'bg-emerald-900/40 border-emerald-500/70 text-emerald-300'
                        : 'bg-space-950 border-slate-700/80 text-slate-500 hover:border-slate-500'
                    }`}
                  >
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
            <Field
              label="後來的結果是？"
              value={entry.splenic.outcome}
              onChange={v => up({ splenic: { ...entry.splenic, outcome: v } })}
              placeholder="信任或不信任直覺之後，發生了什麼？"
            />
          </>
        )}
      </Card>

      {/* 🧪 1/3 調查實驗 */}
      <Card title="🧪 1/3 調查與實驗筆記">
        <Field
          label="今天深研的主題（1 爻）"
          value={entry.investigation.topic}
          onChange={v => up({ investigation: { ...entry.investigation, topic: v } })}
          placeholder="針對哪個主題進行了深度鑽研？"
          rows={1}
        />
        <Field
          label="調查發現"
          value={entry.investigation.findings}
          onChange={v => up({ investigation: { ...entry.investigation, findings: v } })}
          placeholder="掌握了什麼基礎事實或原則？"
        />
        <Field
          label="今天搞砸或不如預期的事（3 爻）"
          value={entry.experiment.whatFailed}
          onChange={v => up({ experiment: { ...entry.experiment, whatFailed: v } })}
          placeholder="哪裡出錯了？發生了什麼？"
        />
        <Field
          label="這個「失敗」提供的數據資產"
          value={entry.experiment.dataLearned}
          onChange={v => up({ experiment: { ...entry.experiment, dataLearned: v } })}
          placeholder="它不是失敗，是資產。它告訴我..."
        />
      </Card>

      {/* 🛠 DIKW 復盤 */}
      <Card title="🛠 DIKW 復盤轉化">
        <p className="text-xs text-slate-600 -mt-2">STAR 框架 — 今日最重要的一件事</p>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="S — 情境"
            value={entry.dikw.situation}
            onChange={v => up({ dikw: { ...entry.dikw, situation: v } })}
            placeholder="背景是什麼？"
          />
          <Field
            label="T — 任務"
            value={entry.dikw.task}
            onChange={v => up({ dikw: { ...entry.dikw, task: v } })}
            placeholder="我的目標是？"
          />
          <Field
            label="A — 行動"
            value={entry.dikw.action}
            onChange={v => up({ dikw: { ...entry.dikw, action: v } })}
            placeholder="我做了什麼？"
          />
          <Field
            label="R — 結果"
            value={entry.dikw.result}
            onChange={v => up({ dikw: { ...entry.dikw, result: v } })}
            placeholder="發生了什麼？"
          />
        </div>

        <div className="border-t border-slate-700/40 pt-4 space-y-4">
          <Field
            label="可控的（我的專業、我的反應）"
            value={entry.dikw.controllable}
            onChange={v => up({ dikw: { ...entry.dikw, controllable: v } })}
            placeholder="哪些在我的掌控之內？"
          />
          <Field
            label="不可控的（他人邀約、環境因素）"
            value={entry.dikw.uncontrollable}
            onChange={v => up({ dikw: { ...entry.dikw, uncontrollable: v } })}
            placeholder="哪些不在我掌控之內？（放下它）"
          />
          <Field
            label="🌟 脾臟給的明日行動建議"
            value={entry.dikw.wisdomAction}
            onChange={v => up({ dikw: { ...entry.dikw, wisdomAction: v } })}
            placeholder="如果明天再來一次，第一秒直覺告訴我..."
          />
        </div>
      </Card>

      <button
        onClick={handleSave}
        className={`w-full py-4 rounded-2xl font-semibold text-base transition-all active:scale-95 ${
          saved
            ? 'bg-emerald-600 text-white'
            : 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/40'
        }`}
      >
        {saved ? '✓ 已儲存' : '儲存今日復盤'}
      </button>
    </div>
  )
}

export default DailyReflection
