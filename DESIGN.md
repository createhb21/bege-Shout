# Design

## Source of truth
- Status: Active
- Last refreshed: 2026-05-17
- Primary product surfaces: Expo React Native app (`mobile/app`), shared components (`mobile/src/components/ui.tsx`), design tokens (`mobile/src/constants/theme.ts`).
- Evidence reviewed:
  - Existing tabs/routes: `mobile/app/(tabs)/_layout.tsx`, `index.tsx`, `history.tsx`, `challenge.tsx`, `community.tsx`, `profile.tsx`.
  - Shared UI primitives: `mobile/src/components/ui.tsx`.
  - Current tokens: `mobile/src/constants/theme.ts`.
  - No prior `DESIGN.md`, screenshots, Figma files, or brand assets were present.

## Brand
- Personality: playful midnight ritual, social-proof driven, creator-friendly, slightly surreal, optimistic.
- Trust signals: clear permission states, readable wake time, challenge status, local-only prototype language when relevant.
- Avoid: copying Instagram exactly, crowded camera overlays, corporate alarm-clock UI, heavy setup forms on capture.

## Product goals
- Goals:
  - Make recording feel like a full-screen social camera/reels experience.
  - Make feed/history/challenge/profile feel like one coherent social app.
  - Keep GNB icon-only and visually lightweight.
- Non-goals:
  - Pixel-match Instagram.
  - Add external services or production social graph.
- Success signals:
  - Video/selfie media remains dominant.
  - Primary actions are icon-first, thumb-friendly, and high contrast.
  - Each tab has an obvious social-app hierarchy without excess text.

## Personas and jobs
- Primary personas: students, creators, professionals, and friends doing playful wake-up challenges.
- User jobs:
  - Record a quick pillow promise.
  - Revisit personal wake-up proof/history.
  - Check morning challenge status.
  - Browse and react to community shouts.
  - Adjust defaults without cluttering capture.
- Key contexts of use: late night, low light, one-handed phone use, quick morning check-in.

## Information architecture
- Primary navigation: icon-only bottom GNB with Capture, History, Challenge, Community, Profile.
- Core routes/screens:
  - Capture: full-screen camera + compact wake-time/record controls.
  - History: media-led archive of recorded shouts.
  - Challenge: next alarm, success rate, check-in cards.
  - Community: reels-style vertical feed with side action rail.
  - Profile: avatar, stats, language/server/default settings.
- Content hierarchy: media first, then author/status/time, then supporting metadata.

## Design principles
- Principle 1: Media is the canvas; controls float only when they help the immediate action.
- Principle 2: Social energy through gradients, rings, icons, counts, and creator captions.
- Principle 3: Defaults live in settings; capture stays minimal.
- Tradeoffs: Instagram familiarity is used for affordances, but colors/copy/ritual cues keep the product distinct.

## Visual language
- Color: near-black midnight base, glass surfaces, vivid aurora gradients (violet/pink/orange/mint) for brand moments.
- Typography: high-weight headers, compact metadata labels, readable body copy.
- Spacing/layout rhythm: 16px mobile rhythm, full-bleed media cards, tight icon rails.
- Shape/radius/elevation: pill nav, 24-32px cards, gradient rings, soft glass borders.
- Motion: lightweight native transitions only for now; future motion should emphasize record/save/check-in.
- Imagery/iconography: icon-only navigation, reels-like action icons, circular profile/story motifs.

## Components
- Existing components to reuse: `AppScreen`, `HeroCard`, `SectionCard`, `SectionTitle`, `PrimaryButton`, `SecondaryButton`, `Badge`, `StatPill`, `EmptyState`, `VideoPreview`.
- New/changed components: no new component layer unless repeated patterns prove necessary; update existing primitives first.
- Variants and states: gradient hero, glass cards, accent/success/warning/danger badges, empty states with dotted borders.
- Token/component ownership: `theme.ts` owns color/radius/spacing/gradient language; `ui.tsx` owns primitive styling.

## Accessibility
- Target standard: practical WCAG AA contrast for text/buttons where possible over dark backgrounds.
- Keyboard/focus behavior: native controls remain reachable; future web focus styling should follow tokens.
- Contrast/readability: overlays over video must include gradient/glass backing.
- Screen-reader semantics: icon-only GNB still needs route titles/options internally.
- Reduced motion and sensory considerations: avoid autoplay motion outside video surfaces when possible.

## Responsive behavior
- Supported breakpoints/devices: iOS/Android phones first; Expo web smoke supported.
- Layout adaptations: vertical feed/cards; controls fit small screens with compact chips.
- Touch/hover differences: phone tap targets should stay near 44px minimum except decorative indicators.

## Interaction states
- Loading: use existing refresh indicators and glass placeholders in future.
- Empty: use editorial empty cards with clear next action.
- Error: keep local/fallback server status visible.
- Success: gradient/success badges and inbox messages.
- Disabled: lower opacity and keep status copy.
- Offline/slow network: community feed falls back to bundled videos and local state.

## Content voice
- Tone: short, playful, confident, late-night creator app.
- Terminology: “shout”, “wake challenge”, “pillow promise”, “reels/community”.
- Microcopy rules: avoid paragraphs on capture; use concise labels and status chips.

## Implementation constraints
- Framework/styling system: Expo Router + React Native StyleSheet + Expo vector icons/linear gradient/video.
- Design-token constraints: use `theme.ts`; do not scatter one-off colors unless tied to video overlay readability.
- Performance constraints: avoid heavy layout nesting in reels feed; no remote design dependencies.
- Compatibility constraints: Expo Go warnings for notifications/media library remain expected; development build needed for full native capability.
- Test/screenshot expectations: `npm run typecheck`, `npx expo export --platform web`, and real-device visual QA when available.

## Open questions
- [ ] Final brand logo/wordmark assets / owner: product / impact: profile/header polish.
- [ ] Whether app should support light mode / owner: product / impact: token expansion.
- [ ] Exact community moderation/reporting UX / owner: product / impact: feed actions.
