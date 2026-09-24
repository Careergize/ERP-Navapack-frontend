# Nava Pack — Frontend

React + TypeScript + Tailwind frontend for the Nava Pack ERP MVP. Talks to a Django REST Framework backend and is wrapped with Capacitor to produce a sideloadable Android APK.

## Setup

```bash
npm install
cp .env.example .env   # point VITE_API_BASE_URL at your DRF backend
npm run dev
```

### Login UI testing

Set `VITE_ENABLE_MOCK_LOGIN=true` to test the login screen without Django. The mock credentials are `admin@navapack.com` (or the legacy `Admin@navpack.com`) / `test@123`; set it back to `false` for the real `POST /api/auth/login/` JWT flow.

The login palette is taken from `public/assets/Nava-logo.png`: navy `#1A3764`, teal `#31A8E0`, green `#3AAA35`, and lime `#94C11F`. Swap the logo by replacing that file, then update the color tokens in `tailwind.config.ts` if the new artwork uses a different palette.

## What's here

- `src/context/AuthContext.tsx` — login/logout, holds the current user + role
- `src/components/layout/AppShell.tsx` — sidebar nav, filtered per role (see `NAV_ITEMS`)
- `src/pages/JobCards/JobCardDetail.tsx` — the 5-stage production sequence, editable per Job Card by Receptionist/Admin (add/remove a stage without touching the Model default)
- `src/pages/TrackTrace/TrackTrace.tsx` — single search box for the "where is X" lookup
- `src/types/index.ts` — shared types matching the backend data model
- `src/lib/api.ts` — Axios client, JWT attached automatically, redirects to `/login` on 401

Modules not yet built (Stock, Recycling, Costing, Masters) are stubbed with `Placeholder` — build them following the same list/detail pattern as Job Cards.

## Building the Android APK (Capacitor)

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Nava Pack" "com.navapack.ops" --web-dir=dist
npm run build
npx cap add android
npx cap sync android
npx cap open android   # opens Android Studio — build > Generate Signed Bundle/APK
```

Sign the release build with your own keystore (not a Play Store key) and distribute the resulting `.apk` directly to employee devices — no Play Console listing required.
