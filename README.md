# DODOHabit

基於 Human Design 投射者框架的每日能量覆盤工具。

透過記錄「成功感」與「苦澀感」，覺察能量狀態，找到屬於自己的節奏。

**Live：** https://dodohabit-955ad.web.app

---

## 功能

- **每日復盤**：記錄成功感 / 苦澀感（1–5 分），苦澀來源分析
- **能量圖譜**：364 天熱力圖、近 30 天趨勢折線圖、近 8 週平均
- **歷史記錄**：瀏覽與編輯過去的記錄
- **跨裝置同步**：透過 Firebase Auth + Firestore 同步資料
- **每日推播提醒**：每天 22:00 推送記錄提醒（需允許通知並安裝 PWA）
- **深色 / 淺色主題**
- **PWA 支援**：可安裝到手機主畫面離線使用

---

## Tech Stack

| 層級 | 技術 |
|------|------|
| 前端 | React + TypeScript + Vite + Tailwind CSS |
| 狀態管理 | Zustand |
| 資料庫 | Firebase Firestore |
| 身份驗證 | Firebase Auth（Google） |
| Hosting | Firebase Hosting |
| 推播通知 | Firebase Cloud Messaging + Cloudflare Workers (Cron) |
| 圖表 | Recharts |

---

## 本地開發

```bash
# 安裝依賴
yarn install

# 建立 .env（參考下方環境變數說明）
cp .env.example .env

# 啟動開發伺服器
yarn dev

# 建置
yarn build
```

### 環境變數

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_VAPID_KEY=
```

---

## 部署

**前端（Firebase Hosting）：**
```bash
yarn build
firebase deploy --only hosting
```

**推播排程（Cloudflare Worker）：**
```bash
cd cloudflare-worker
yarn install
npx wrangler deploy
```

---

## Firestore 安全規則

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/entries/{entryId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /fcmTokens/{userId} {
      allow read: if false;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
