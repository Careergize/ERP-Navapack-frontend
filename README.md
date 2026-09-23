# Nava Pack — Frontend

React + TypeScript + Tailwind frontend for the Nava Pack ERP MVP. Talks to a Django REST Framework backend and is wrapped with Capacitor to produce a sideloadable Android APK.

## Setup

```bash
npm install
cp .env.example .env   # point VITE_API_BASE_URL at your DRF backend
npm run dev
```

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
