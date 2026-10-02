# Installation & Release Guide

## Prerequisites

- Node.js and npm
- MySQL (for Prisma `DATABASE_URL` and `SHADOW_DATABASE_URL`)
- For local native runs: Xcode (iOS Simulator) and/or Android Studio (emulator or USB device)
- Expo account and EAS CLI for cloud builds (`npm i -g eas-cli` or use `npx eas`)
- Apple Developer account and App Store Connect access (iOS submit)
- Google Play Console access; Android EAS submit expects `client/expo-SB-ServiceAccount.json` (see `eas.json`)

---

## 1. Clone

```bash
git clone https://github.com/aju-alen/safari-books.git
cd safari-books
```

---

## 2. API (`api/`)

```bash
cd api
npm install
```

Copy the sample env and fill in your values:

```bash
cp sample.env .env
```

This API uses Prisma with MySQL. Ensure `DATABASE_URL` and `SHADOW_DATABASE_URL` are set in `.env`, then generate the Prisma client:

```bash
npx prisma generate
```

If you need a fresh database schema, run migrations as appropriate for your environment (`npx prisma migrate deploy` or `npx prisma migrate dev`).

Start the server:

```bash
npm run dev
```

The API defaults to port `3001` unless `PORT` is set in `.env`.

---

## 3. Client (`client/`) — install & local native run

```bash
cd client
npm install
```

Copy the sample env and fill in your values:

```bash
cp sample.env .env
```

### Local API URL

Set `EXPO_PUBLIC_BACKEND_URL` in `client/.env`:

- Physical device on the same network: `http://<YOUR-LAN-IP>:3001`
- Simulator/emulator talking to API on the same machine: `http://localhost:3001` (Android emulator may need `http://10.0.2.2:3001`)

If `EXPO_PUBLIC_BACKEND_URL` is unset, `src/utils/backendURL.ts` falls back to `https://backend.safbooks.com`. You can also change that fallback in code when needed.

On macOS, get your LAN IP with:

```bash
ipconfig getifaddr en0
```

### Run on iOS Simulator

Requires Xcode and an available simulator:

```bash
npm run ios
# or
npx expo run:ios
```

### Run on Android Emulator / device

Requires Android SDK and a running emulator or connected device:

```bash
npm run android
# or
npx expo run:android
```

### Metro only (after a native binary exists)

```bash
npm start
# or
npx expo start
```

This project uses `expo-dev-client`. Prefer `expo run:ios` / `expo run:android` over Expo Go when you need full native modules.

---

## 4. EAS Build (`client/`, profile `production`)

```bash
cd client
eas login
```

The EAS project is already linked via `app.json` / `eas.json`.

Build for iOS:

```bash
eas build --platform ios --profile production
```

Build for Android:

```bash
eas build --platform android --profile production
```

Build both:

```bash
eas build --platform all --profile production
```

When complete, download artifacts from the Expo / EAS dashboard.

---

## 5. EAS Submit — iOS & Android

### iOS

After a successful iOS production build:

```bash
cd client
eas submit --platform ios --profile production
```

This uses the iOS fields in `eas.json` under `submit.production` (`appleId`, `ascAppId`, `appleTeamId`).

Then finish the App Store Connect listing and submit for review if anything remains incomplete.

### Android

Ensure `client/expo-SB-ServiceAccount.json` is present locally (path referenced in `eas.json`; treat it as a secret and do not commit it if it is not already meant to be in git).

After a successful Android production build:

```bash
cd client
eas submit --platform android --profile production
```

This submits to the Play track configured in `eas.json` (`internal`). Complete store listing / review steps in Google Play Console as needed.

---

## 6. Landing site (`SB-landing_page/`)

```bash
cd SB-landing_page
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

Optional production-like local serve:

```bash
npm run build
npm run preview
```

No environment sample file is required for the landing page.

---

## 7. Typical local start order

1. Start the API (`api/` → `npm run dev`)
2. Start the client (`client/` → `npm run ios` / `npm run android` or `npm start`)
3. Start the landing page when needed (`SB-landing_page/` → `npm run dev`)
