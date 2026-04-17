import { useState, useCallback, useEffect } from 'react'
import { collection, getDocs, setDoc, doc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { DailyEntry } from '../types'

const STORAGE_KEY = 'dodo_entries_v1'

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

  // 登入後從 Firestore 拉取資料並合併
  useEffect(() => {
    if (!userId) return

    const sync = async () => {
      setSyncing(true)
      try {
        const snapshot = await getDocs(collection(db, 'users', userId, 'entries'))
        const remote: DailyEntry[] = snapshot.docs.map(d => d.data() as DailyEntry)

        setEntries(prev => {
          const remoteMap = new Map(remote.map(e => [e.date, e]))
          // 找出本機有但雲端沒有的（離線建立的記錄）
          const localOnly = prev.filter(e => !remoteMap.has(e.date))

          // 將離線記錄推上 Firestore
          if (localOnly.length > 0) {
            Promise.all(
              localOnly.map(e =>
                setDoc(doc(db, 'users', userId, 'entries', e.date), e)
              )
            ).catch(err => console.error('Push offline entries failed:', err))
          }

          const merged = [...remote, ...localOnly]
          merged.sort((a, b) => b.date.localeCompare(a.date))
          return persist(merged)
        })
      } catch (err) {
        console.error('Firestore sync failed:', err)
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

      // 同步至 Firestore（背景執行）
      if (userId) {
        setDoc(doc(db, 'users', userId, 'entries', entry.date), entry).catch(err =>
          console.error('Firestore save failed:', err)
        )
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
