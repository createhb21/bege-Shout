# Bege Shout 🧸📣

Local-first prototype for a playful wake-up challenge app built with **Expo + React Native + TypeScript** and a **local Node API**.

## What is implemented

- **Launch-to-selfie capture flow** with front camera video recording
- **Wake-up shout metadata**: wake time, pillow note, share toggle, library save toggle
- **History by date** for recorded shout videos
- **Wake challenge flow** with local notifications and next-morning check-in tracking
- **Community reels feed** with local server sync, likes, comments, and local-upload fallback
- **Offline save** for community videos
- **Essential pages**: capture, history, challenge, community, notifications, my page/settings
- **Built-in i18n** for Korean / English
- **Local-only backend** for feed, comments, likes, uploads, and static MP4 serving

## Repository layout

```text
mobile/   Expo React Native app
server/   Local TypeScript Express API
```

## Prerequisites

- Node.js 22+
- npm 10+
- Xcode / Android Studio / Expo tooling as needed
- `ffmpeg` only if you want to regenerate sample MP4s

## Run the prototype

### 1) Local API

```bash
npm run server
```

Server default: `http://127.0.0.1:4000`

Useful commands:

```bash
npm run seed:videos
npm run typecheck:server
```

### 2) Mobile app

```bash
npm run mobile
```

Or directly:

```bash
npm run ios
npm run android
npm run web
```

## Notes for device testing

- **iOS simulator** default API base URL works with `127.0.0.1:4000`
- **Android emulator** default API base URL works with `10.0.2.2:4000`
- **Physical device**: open **My Page** and replace the API base URL with your Mac's LAN IP, e.g. `http://192.168.x.x:4000`

## Verification

```bash
npm run typecheck
```

Additional smoke checks used during implementation:

- Expo web export for bundling sanity
- `/health` and `/api/feed/posts` server responses
- local like/comment/upload endpoint checks

## Local-only constraint

This prototype intentionally avoids AWS and any external backend/service. Feed data, uploads, and sample media live inside this repository and on the local machine only.
