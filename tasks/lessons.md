# Lessons

- Keep project-local Codex feature flags explicit when a workflow depends on them, even if the same flag is already enabled globally.
- Verify Codex goal mode with the native goal tools or interactive slash UI, not by looking for shell commands like `get_goal`.
- When app and local API are developed in parallel, lock API paths and payload names early or budget time for a normalization pass on the client.
- After server smoke tests that mutate seed JSON, immediately restore deterministic seed state before final verification or commit.
- For Expo Go prototypes, never gate core capture on optional media-library or notification permissions; Android/Expo Go limitations can make optional permissions look unavailable even when camera recording should work.
- In camera screens, request permissions before checking a camera ref; without permission the preview is not mounted, so a ref-first guard makes the record button silently do nothing.
- For camera-first mobile experiences, make the preview the full-screen base layer and float wake-time/metadata controls as high-contrast overlays; card layouts make recording feel secondary.
- When users say the camera UI is cluttered, remove controls from capture rather than restyling them; move defaults such as sharing and album save to settings and leave only compact time plus record controls over video.
- For social-app redesign requests, create or refresh DESIGN.md first, then centralize the visual language in theme/ui primitives before touching individual screens.
- For Instagram-inspired requirements, copy interaction patterns only at the abstraction level (icon-only nav, reels media hierarchy, gradient rings), not exact layouts or brand assets.
- When screenshot assets already live under a repo-local `photos/` folder, expose them in the root README as a simple ordered gallery instead of leaving the project overview text-only.
