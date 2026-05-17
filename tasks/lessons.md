# Lessons

- Keep project-local Codex feature flags explicit when a workflow depends on them, even if the same flag is already enabled globally.
- Verify Codex goal mode with the native goal tools or interactive slash UI, not by looking for shell commands like `get_goal`.
- When app and local API are developed in parallel, lock API paths and payload names early or budget time for a normalization pass on the client.
- After server smoke tests that mutate seed JSON, immediately restore deterministic seed state before final verification or commit.
- For Expo Go prototypes, never gate core capture on optional media-library or notification permissions; Android/Expo Go limitations can make optional permissions look unavailable even when camera recording should work.
- In camera screens, request permissions before checking a camera ref; without permission the preview is not mounted, so a ref-first guard makes the record button silently do nothing.
