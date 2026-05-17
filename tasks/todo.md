# Todo

## Delivery checklist

- [x] Scaffold a TypeScript Expo React Native mobile app with a production-like multi-screen structure.
- [x] Scaffold a local-only server for prototype community/feed data and interaction APIs.
- [x] Implement launch-to-selfie capture flow with camera, microphone, media-library, and notification permission handling.
- [x] Implement shout recording metadata flow: wake time, challenge setup, save/upload state, and local persistence.
- [x] Implement history/timeline by date for recorded shout videos.
- [x] Implement challenge flow for next-morning wake check, local alarm scheduling, and success/failure status.
- [x] Implement community reels-style feed with video playback, likes, comments, feedback, and local-server sync/fallback.
- [x] Implement offline download/save flow for community videos and persisted offline library access.
- [x] Implement essential product pages: onboarding/permissions, capture, history, challenge, community, notifications, and my page/settings.
- [x] Add in-app multilingual support (at least Korean and English).
- [x] Verify app/server commands, typecheck/lint where available, and document setup/run flow.
- [x] Commit meaningful milestones, push progress, and capture review notes.

## Inferred product decisions

- [x] Use a monorepo-style layout with `mobile/` (Expo app) and `server/` (local Node API) so the prototype stays local-only.
- [x] Use local notifications as the wake challenge trigger and a morning check-in proof flow as the measurable challenge result.
- [x] Support offline behavior through on-device persistence plus downloadable community media files.

## Review

- Repository started almost empty; implemented a full Expo Router mobile prototype under `mobile/` and a local TypeScript API under `server/`.
- Verified `npm run typecheck` at repo root after installing mobile/server dependencies.
- Verified Expo bundling with `cd mobile && npx expo export --platform web`.
- Verified server API with `GET /health`, `GET /api/feed/posts`, `POST /api/feed/posts/:id/like`, `POST /api/feed/posts/:id/comments`, and `POST /api/shouts/upload`, then restored seed data afterward.
- README now documents run flow, local-only constraint, device URL notes, and verification commands.
- Remaining prototype risk: camera recording, local notifications, and permission UX were statically/bundle validated but not fully exercised on a real iOS/Android device inside this session.
