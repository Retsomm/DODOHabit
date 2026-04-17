import { useState, useCallback, useEffect } from 'react'
import {
  DailyEntry,
  BitternessSource,
  SplenicData,
  InvestigationData,
  ExperimentData,
  DikwData,
} from '../types'
import { supabase } from '../lib/supabase'

const STORAGE_KEY = 'dodo_entries_v1'

type DBRow = Record<string, unknown>

const toDB = (entry: DailyEntry, userId: string) => ({
  id: entry.id,
  user_id: userId,
  date: entry.date,
  success_score: entry.successScore,
  bitterness_score: entry.bitternessScore,
  success_moment: entry.successMoment,
  bitterness_source: entry.bitternessSource,
  emotional_state: entry.emotionalState,
  splenic: entry.splenic,
  investigation: entry.investigation,
  experiment: entry.experiment,
  dikw: entry.dikw,
  created_at: entry.createdAt,
  updated_at: entry.updatedAt,
})

const fromDB = (row: DBRow): DailyEntry => ({
  id: row.id as string,
  date: row.date as string,
  successScore: row.success_score as number,
  bitternessScore: row.bitterness_score as number,
  successMoment: (row.success_moment as string) ?? '',
  bitternessSource: (row.bitterness_source as BitternessSource) ?? 'none',
  emotionalState: (row.emotional_state as string) ?? '',
  splenic: (row.splenic as SplenicData) ?? {
    hadIntuition: false,
    description: '',
    trusted: false,
    outcome: '',
  },
  investigation: (row.investigation as InvestigationData) ?? { topic: '', findings: '' },
  experiment: (row.experiment as ExperimentData) ?? { whatFailed: '', dataLearned: '' },
  dikw: (row.dikw as DikwData) ?? {
    situation: '', task: '', action: '', result: '',
    controllable: '', uncontrollable: '', wisdomAction: '',
  },
  createdAt: (row.created_at as string) ?? new Date().toISOString(),
  updatedAt: (row.updated_at as string) ?? new Date().toISOString(),
})

const persist = (next: DailyEntry[]): DailyEntry[] => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

const useStorage = (userId?: string) => {
  const [entries, setEntries] = useState<DailyEntry[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })
  const [syncing, setSyncing] = useState(false)

  // 登入後從 Supabase 拉取資料並合併
  useEffect(() => {
    if (!userId) return

    const sync = async () => {
      setSyncing(true)
      try {
        const { data, error } = await supabase
          .from('daily_entries')
          .select('*')
          .eq('user_id', userId)

        if (error) throw error

        const remote = (data ?? []).map(fromDB)

        setEntries(prev => {
          const remoteMap = new Map(remote.map(e => [e.date, e]))
          // 找出本機有但雲端沒有的（離線建立的記錄）
          const localOnly = prev.filter(e => !remoteMap.has(e.date))

          // 將離線記錄推上 Supabase
          if (localOnly.length > 0) {
            supabase
              .from('daily_entries')
              .upsert(localOnly.map(e => toDB(e, userId)))
              .then(({ error }) => {
                if (error) console.error('Push offline entries failed:', error)
              })
          }

          // 合併：remote 為主，本機離線記錄補充
          const merged = [...remote, ...localOnly]
          merged.sort((a, b) => b.date.localeCompare(a.date))
          return persist(merged)
        })
      } catch (err) {
        console.error('Supabase sync failed:', err)
      } finally {
        setSyncing(false)
      }
    }

    sync()
  }, [userId])

  const saveEntry = useCallback(
    (entry: DailyEntry) => {
      // 立即存入 localStorage
      setEntries(prev => {
        const idx = prev.findIndex(e => e.date === entry.date)
        const next =
          idx >= 0 ? prev.map((e, i) => (i === idx ? entry : e)) : [...prev, entry]
        return persist(next)
      })

      // 同步至 Supabase（背景執行）
      if (userId) {
        supabase
          .from('daily_entries')
          .upsert(toDB(entry, userId), { onConflict: 'user_id,date' })
          .then(({ error }) => {
            if (error) console.error('Supabase upsert failed:', error)
          })
      }
    },
    [userId]
  )

  const getByDate = useCallback(
    (date: string) => entries.find(e => e.date === date),
    [entries]
  )

  return { entries, saveEntry, getByDate, syncing }
}

export default useStorage
