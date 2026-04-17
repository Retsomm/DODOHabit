interface Env {
  FIREBASE_PROJECT_ID: string
  FIREBASE_CLIENT_EMAIL: string
  FIREBASE_PRIVATE_KEY: string
}

interface FirestoreDocument {
  fields?: {
    token?: { stringValue?: string }
  }
}

interface FirestoreListResponse {
  documents?: FirestoreDocument[]
}

interface AccessTokenResponse {
  access_token: string
}

const b64url = (obj: object): string =>
  btoa(JSON.stringify(obj))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

const createJWT = async (email: string, privateKeyPem: string): Promise<string> => {
  const now = Math.floor(Date.now() / 1000)

  const header = { alg: 'RS256', typ: 'JWT' }
  const payload = {
    iss: email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }

  const headerPayload = `${b64url(header)}.${b64url(payload)}`

  const pemContent = privateKeyPem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '')

  const binaryDer = Uint8Array.from(atob(pemContent), c => c.charCodeAt(0))

  const key = await crypto.subtle.importKey(
    'pkcs8',
    binaryDer.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const sig = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(headerPayload)
  )

  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  return `${headerPayload}.${sigB64}`
}

const getAccessToken = async (email: string, privateKey: string): Promise<string> => {
  const jwt = await createJWT(email, privateKey)
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })
  const data = await res.json() as AccessTokenResponse
  return data.access_token
}

const getFcmTokens = async (projectId: string, accessToken: string): Promise<string[]> => {
  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/fcmTokens`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  const data = await res.json() as FirestoreListResponse
  if (!data.documents) return []
  return data.documents
    .map(d => d.fields?.token?.stringValue)
    .filter((t): t is string => !!t)
}

const sendNotification = async (
  projectId: string,
  accessToken: string,
  fcmToken: string
): Promise<void> => {
  await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          token: fcmToken,
          notification: {
            title: 'DODOHabit 每日提醒',
            body: '今天的能量記錄還沒寫喔，花 2 分鐘覆盤一下吧 🌙',
          },
          webpush: {
            notification: {
              icon: 'https://dodohabit-955ad.web.app/icon.svg',
            },
            fcm_options: {
              link: 'https://dodohabit-955ad.web.app',
            },
          },
        },
      }),
    }
  )
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    const accessToken = await getAccessToken(env.FIREBASE_CLIENT_EMAIL, env.FIREBASE_PRIVATE_KEY)
    const tokens = await getFcmTokens(env.FIREBASE_PROJECT_ID, accessToken)
    await Promise.all(tokens.map(token => sendNotification(env.FIREBASE_PROJECT_ID, accessToken, token)))
  },
}
