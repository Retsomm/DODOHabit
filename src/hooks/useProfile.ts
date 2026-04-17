import { useState, useEffect, useCallback } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

export interface UserProfile {
  displayName: string
  photoDataUrl: string
  photoPosition: { x: number; y: number }
}

const useProfile = (userId?: string) => {
  const [profile, setProfile] = useState<UserProfile>({ displayName: '', photoDataUrl: '', photoPosition: { x: 50, y: 50 } })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!userId) {
      setProfile({ displayName: '', photoDataUrl: '', photoPosition: { x: 50, y: 50 } })
      return
    }
    setProfile({ displayName: '', photoDataUrl: '', photoPosition: { x: 50, y: 50 } })
    getDoc(doc(db, 'users', userId)).then(snap => {
      if (snap.exists()) {
        const d = snap.data()
        setProfile({
          displayName: d.displayName ?? '',
          photoDataUrl: d.photoDataUrl ?? '',
          photoPosition: d.photoPosition ?? { x: 50, y: 50 },
        })
      }
    })
  }, [userId])

  const saveProfile = useCallback(async (next: Partial<UserProfile>) => {
    if (!userId) return
    setSaving(true)
    try {
      const updated = { ...profile, ...next }
      await setDoc(doc(db, 'users', userId), updated, { merge: true })
      setProfile(updated)
    } finally {
      setSaving(false)
    }
  }, [userId, profile])

  return { profile, saveProfile, saving }
}

export default useProfile
