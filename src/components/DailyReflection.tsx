import { useState, useEffect } from 'react'
import { Zap, Eye, TestTube2, Layers, ChevronLeft, Check, Save } from 'lucide-react'
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
  successScore: 5,
  bitternessScore: 5,
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

const ScoreSlider = ({
  value,
  color,
  onChange,
}: {
  value: number
  color: 'violet' | 'amber'
  onChange: (v: number) => void
}) => {
  const thumbCls = color === 'violet'
    ? '[&::-webkit-slider-thumb]:bg-violet-600 [&::-moz-range-thumb]:bg-violet-600'
    : '[&::-webkit-slider-thumb]:bg-amber-500 [&::-moz-range-thumb]:bg-amber-500'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span
          className={`text-3xl font-bold tabular-nums ${
            color === 'violet'
              ? 'text-violet-600 dark:text-violet-400'
              : 'text-amber-500 dark:text-amber-400'
          }`}
        >
          {value}
        </span>
        <span className="text-sm text-gray-400 dark:text-slate-500">/ 10</span>
      </div>
      <div className="relative flex items-center h-5">
        <div className="absolute w-full h-2 rounded-full bg-gray-200 dark:bg-slate-700 pointer-events-none" />
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className={`relative w-full appearance-none bg-transparent cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:shadow-sm
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:border-0
            ${thumbCls}`}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400 dark:text-slate-500">
        <span>0</span>
        <span>5</span>
        <span>10</span>
      </div>
    </div>
  )
}

const Card = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) => (
  <div className="bg-white dark:bg-space-800 rounded-2xl p-5 space-y-4 border border-gray-200 dark:border-slate-700/50">
    <div className="flex items-center gap-2.5">
      {icon}
      <h3 className="text-sm font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest">
        {title}
      </h3>
    </div>
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
  <div className="space-y-2">
    <label className="text-base font-medium text-gray-700 dark:text-slate-300">{label}</label>
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-gray-50 dark:bg-space-950 border border-gray-300 dark:border-slate-600/60 rounded-xl px-3.5 py-3 text-base text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-600 focus:outline-none focus:border-violet-500 dark:focus:border-violet-500/70 resize-none transition-colors"
    />
  </div>
)

const BITTERNESS_OPTS: { value: BitternessSource; label: string }[] = [
  { value: 'self-initiated', label: '主動發起' },
  { value: 'over-working', label: '過度勞動' },
  { value: 'both', label: '兩者都有' },
  { value: 'none', label: '沒有苦澀' },
]

type SaveStatus = 'unsaved' | 'saving' | 'saved'

const DailyReflection = ({ viewDate, existingEntry, onSave, onBack }: Props) => {
  const [entry, setEntry] = useState<DailyEntry>(existingEntry ?? makeDefault(viewDate))
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(existingEntry ? 'saved' : 'unsaved')
  const isToday = viewDate === todayStr()

  useEffect(() => {
    setEntry(existingEntry ?? makeDefault(viewDate))
    setSaveStatus(existingEntry ? 'saved' : 'unsaved')
  }, [existingEntry, viewDate])

  const up = (partial: Partial<DailyEntry>) => {
    setEntry(prev => ({ ...prev, ...partial, updatedAt: new Date().toISOString() }))
    setSaveStatus('unsaved')
  }

  const energyScore = entry.successScore - entry.bitternessScore
  const energyLabel =
    energyScore >= 6 ? '能量充沛'
    : energyScore >= 2 ? '狀態不錯'
    : energyScore >= -1 ? '能量平衡'
    : energyScore >= -5 ? '注意苦澀'
    : '需要休息'
  const energyColor =
    energyScore >= 6 ? 'text-emerald-600 dark:text-emerald-400'
    : energyScore >= 2 ? 'text-teal-600 dark:text-teal-400'
    : energyScore >= -1 ? 'text-blue-600 dark:text-blue-400'
    : energyScore >= -5 ? 'text-amber-600 dark:text-amber-400'
    : 'text-red-600 dark:text-red-400'

  const handleSave = () => {
    setSaveStatus('saving')
    onSave(entry)
    setTimeout(() => setSaveStatus('saved'), 600)
  }

  return (
    <div className="px-4 pt-5 pb-28 max-w-lg mx-auto space-y-4">
      {!isToday && onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-base text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 transition-colors -mb-1"
        >
          <ChevronLeft className="w-4 h-4" />
          返回歷史記錄
        </button>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
            {isToday ? '今日復盤' : '過去記錄'}
          </h1>
          <p className="text-base text-gray-500 dark:text-slate-400 mt-0.5">
            {formatDisplay(viewDate)}
            {!isToday && (
              <span className="text-amber-600 dark:text-amber-500 text-sm ml-2">（編輯模式）</span>
            )}
          </p>
        </div>
        <span className={`text-base font-semibold mt-1 ${energyColor}`}>{energyLabel}</span>
      </div>

      {/* ⚡ 能量場覺察 */}
      <Card
        icon={<Zap className="w-4 h-4 text-violet-500 dark:text-violet-400" />}
        title="能量場覺察"
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-base font-medium text-gray-700 dark:text-slate-300">成功感</label>
            <ScoreSlider
              value={entry.successScore}
              color="violet"
              onChange={v => up({ successScore: v })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-base font-medium text-gray-700 dark:text-slate-300">苦澀感</label>
            <ScoreSlider
              value={entry.bitternessScore}
              color="amber"
              onChange={v => up({ bitternessScore: v })}
            />
          </div>
        </div>

        <Field
          label="成功感瞬間 — 我被正確邀請的那一刻是？"
          value={entry.successMoment}
          onChange={v => up({ successMoment: v })}
          placeholder="描述那個被看見、被認可的瞬間..."
        />

        <div className="space-y-2.5">
          <label className="text-base font-medium text-gray-700 dark:text-slate-300">苦澀來自於？</label>
          <div className="grid grid-cols-2 gap-2">
            {BITTERNESS_OPTS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => up({ bitternessSource: opt.value })}
                className={`py-2.5 px-3 rounded-xl text-base font-medium transition-all border ${
                  entry.bitternessSource === opt.value
                    ? 'bg-amber-50 dark:bg-amber-900/40 border-amber-400 dark:border-amber-600/70 text-amber-700 dark:text-amber-300'
                    : 'bg-gray-50 dark:bg-space-950 border-gray-300 dark:border-slate-700/80 text-gray-500 dark:text-slate-400 hover:border-gray-400 dark:hover:border-slate-500'
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
      <Card
        icon={<Eye className="w-4 h-4 text-violet-500 dark:text-violet-400" />}
        title="脾臟直覺回顧"
      >
        <div className="space-y-2.5">
          <label className="text-base font-medium text-gray-700 dark:text-slate-300">
            今天有出現第一秒直覺嗎？
          </label>
          <div className="flex gap-2">
            {[
              { v: true, l: '有' },
              { v: false, l: '沒有' },
            ].map(opt => (
              <button
                key={String(opt.v)}
                type="button"
                onClick={() => up({ splenic: { ...entry.splenic, hadIntuition: opt.v } })}
                className={`flex-1 py-3 rounded-xl text-base font-medium transition-all border ${
                  entry.splenic.hadIntuition === opt.v
                    ? 'bg-violet-50 dark:bg-violet-900/40 border-violet-400 dark:border-violet-500/70 text-violet-700 dark:text-violet-300'
                    : 'bg-gray-50 dark:bg-space-950 border-gray-300 dark:border-slate-700/80 text-gray-500 dark:text-slate-400'
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
            <div className="space-y-2.5">
              <label className="text-base font-medium text-gray-700 dark:text-slate-300">
                我選擇信任它嗎？
              </label>
              <div className="flex gap-2">
                {[
                  { v: true, l: '信任了' },
                  { v: false, l: '大腦壓過了' },
                ].map(opt => (
                  <button
                    key={String(opt.v)}
                    type="button"
                    onClick={() => up({ splenic: { ...entry.splenic, trusted: opt.v } })}
                    className={`flex-1 py-3 rounded-xl text-base font-medium transition-all border ${
                      entry.splenic.trusted === opt.v
                        ? 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-400 dark:border-emerald-500/70 text-emerald-700 dark:text-emerald-300'
                        : 'bg-gray-50 dark:bg-space-950 border-gray-300 dark:border-slate-700/80 text-gray-500 dark:text-slate-400'
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
      <Card
        icon={<TestTube2 className="w-4 h-4 text-violet-500 dark:text-violet-400" />}
        title="1/3 調查與實驗筆記"
      >
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
      <Card
        icon={<Layers className="w-4 h-4 text-violet-500 dark:text-violet-400" />}
        title="DIKW 復盤轉化"
      >
        <p className="text-sm text-gray-400 dark:text-slate-500 -mt-2">
          STAR 框架 — 今日最重要的一件事
        </p>
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

        <div className="border-t border-gray-200 dark:border-slate-700/40 pt-4 space-y-4">
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
            label="脾臟給的明日行動建議"
            value={entry.dikw.wisdomAction}
            onChange={v => up({ dikw: { ...entry.dikw, wisdomAction: v } })}
            placeholder="如果明天再來一次，第一秒直覺告訴我..."
          />
        </div>
      </Card>

      <button
        onClick={handleSave}
        disabled={saveStatus === 'saving'}
        className={`w-full py-4 rounded-2xl font-semibold text-base transition-all active:scale-95 flex items-center justify-center gap-2 ${
          saveStatus === 'saved'
            ? 'bg-emerald-500 dark:bg-emerald-600 text-white'
            : saveStatus === 'saving'
            ? 'bg-violet-400 dark:bg-violet-800 text-white cursor-not-allowed'
            : 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-200 dark:shadow-violet-900/40'
        }`}
      >
        {saveStatus === 'saved' ? (
          <>
            <Check className="w-5 h-5" />
            儲存完成
          </>
        ) : saveStatus === 'saving' ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            儲存中
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            未儲存 — 點擊儲存
          </>
        )}
      </button>
    </div>
  )
}

export default DailyReflection
