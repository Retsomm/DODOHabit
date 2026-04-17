import { getMessaging, getToken } from 'firebase/messaging'
import { doc, setDoc } from 'firebase/firestore'
import { app, db } from './firebase'

export const setupNotifications = async (userId: string): Promise<void> => {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return
  if (Notification.permission === 'denied') return

  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return

    const messaging = getMessaging(app)
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    })

    if (token) {
      await setDoc(doc(db, 'fcmTokens', userId), {
        token,
        updatedAt: new Date().toISOString(),
      })
    }
  } catch {
    // 通知設定失敗時靜默處理，不影響主要功能
  }
}
