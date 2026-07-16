# Shipping TODO — Android Release

Tracking everything left to get this app onto the Google Play Store.

## ⚠️ Naming / Trademark (do this first)

- [x] Rename the app — now **Up & Under** (renamed to avoid trademark risk with the original game/publisher this was inspired by)
- [x] Remove/avoid any references to the original publisher in listing copy, code, or assets — confirmed none remain anywhere in the repo
- [x] Pick icon art — two candidates in `resources/` (`icon.png` currently wired as the app icon, `icon-alt.png` as a backup); still need to settle on one for real (see Open Questions)

## Game Assets

- [x] Real card images wired in — hand cards use `www/cards/neutral/`, pile top cards use direction-styled `www/cards/full/up_*` / `down_*`, replacing the plain number-on-box placeholders

## App Fixes (do first — testable in a regular browser)

- [x] Add `localStorage` save/restore of game `state` so the game survives the OS backgrounding/killing the app — saves on every turn/play/undo, restores on load, clears on game end ([www/script.js:19](www/script.js#L19))
- [x] Replace the `confirm()` dialog on Give Up with an in-app modal ([www/index.html](www/index.html), `showConfirmModal()` in [www/script.js:67](www/script.js#L67))
- [x] Fix `:hover` card-lift effect for touch — hover now gated behind `@media (hover: hover)`, with a proper `:active` press state for touch ([www/style.css](www/style.css))
- [x] Add `viewport-fit=cover` to the meta viewport + `env(safe-area-inset-*)` padding for notches/gesture bars
- [x] Prevent double-tap-to-zoom and text selection — `touch-action: manipulation` + `user-select: none` on cards/piles/buttons, `-webkit-tap-highlight-color: transparent` globally
- [x] Re-check touch target sizing on small screens — bumped hand cards from 52×74px to 58×80px on the small-screen breakpoint

**Not yet verified in an actual browser/device** — these were implemented and statically checked (element IDs, CSS classes, filenames all confirmed to resolve), but not visually exercised end-to-end. Worth a manual pass before considering this section fully done.

## GitHub Pages

- [x] Root `index.html` redirect stub + `.nojekyll` added so GitHub Pages' simple "deploy from branch (root)" mode keeps working even though the real game lives in `www/` — no duplicated files, `www/` stays the single source of truth
- [ ] In the repo's GitHub Settings → Pages, set source to the `main` branch, root folder (once you're ready to publish)

## Native Wrapper (Capacitor)

- [x] Project structure reorganized: web assets in `www/`, source icon art in `resources/`, `package.json` + `capacitor.config.json` at root (webDir → `www`)
- [x] Capacitor dependencies installed (`@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/assets`)
- [x] Hardware/browser back button handled — implemented with the standard History API (`popstate` + a re-armed guard entry) instead of the `@capacitor/app` plugin, so it needs no native install and also works as the regular browser back button during local testing ([www/script.js](www/script.js), bottom of file). Rules/Game Over → back to setup; mid-game → shows the give-up confirm; pass screen swallows it (would leak the other player's turn); setup screen lets it exit naturally.
- [x] Native polish implemented via standard Web APIs instead of native plugins (no install required): haptic tap on card play (`navigator.vibrate`), keep-screen-awake while the game screen is active (Screen Wake Lock API, released when leaving/backgrounded), best-effort portrait lock (`screen.orientation.lock`) — all no-op safely where unsupported
- [ ] `npx cap add android` — requires Android Studio / Android SDK installed locally; confirm it builds and runs in an emulator
- [ ] Run `npx capacitor-assets generate --android` to generate native icon densities from `resources/icon.png` once the android platform exists
- [ ] Replace placeholder `appId` (`com.upandunder.app`) in [capacitor.config.json](capacitor.config.json) with your real reverse-domain package name before building — needs your call, see Open Questions

## Play Store Submission Requirements

- [ ] Create a Play Console developer account ($25 one-time fee)
- [ ] Set up app signing via Play App Signing
- [ ] Confirm `targetSdk` meets the current Play requirement (API 35)
- [ ] Write and host a privacy policy URL; fill out the Data Safety form (declare no data collected)
- [ ] Complete the IARC content rating questionnaire
- [ ] Produce store listing assets: icon (512×512), feature graphic (1024×500), 2–8 phone screenshots, short + full description
- [ ] Submit to closed/internal testing track before requesting production release

## Open Questions (not yet decided)

- [ ] Final pick between `resources/icon.png` (large "&" watermark) vs `resources/icon-alt.png` (inline "&") as the real app icon
- [ ] Reverse-domain package/app ID to replace the `com.upandunder.app` placeholder
- [ ] Any monetization (ads, one-time purchase, free) — affects Play Console setup and store listing
