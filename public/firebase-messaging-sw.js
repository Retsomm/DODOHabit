importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyDMJk8HMvehudj2-pLh9jurTGNctcBswqA',
  authDomain: 'dodohabit-955ad.firebaseapp.com',
  projectId: 'dodohabit-955ad',
  storageBucket: 'dodohabit-955ad.firebasestorage.app',
  messagingSenderId: '812692627082',
  appId: '1:812692627082:web:0ab3f6846b740b26cc5773',
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(
    payload.notification?.title ?? 'DODOHabit',
    {
      body: payload.notification?.body ?? '',
      icon: '/icon.svg',
      badge: '/icon.svg',
    }
  )
})
