# Lessons

- Keep project-local Codex feature flags explicit when a workflow depends on them, even if the same flag is already enabled globally.
- Verify Codex goal mode with the native goal tools or interactive slash UI, not by looking for shell commands like `get_goal`.
- When app and local API are developed in parallel, lock API paths and payload names early or budget time for a normalization pass on the client.
- After server smoke tests that mutate seed JSON, immediately restore deterministic seed state before final verification or commit.
