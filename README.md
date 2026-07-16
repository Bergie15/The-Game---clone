# Up & Under

A browser-based cooperative card game, inspired by classic ascending/descending pile-based card games. Play cards 2–99 onto four piles — two ascending from 1, two descending from 100 — using the "exactly 10 back" trick to reverse a pile's direction. Supports 1–5 players in local pass-and-play mode.

## Project layout

```
www/         the game itself — index.html, script.js, style.css (Capacitor's webDir)
resources/   source app icon art (1024x1024), used to generate native icons
android/     generated native Android project (created by `npx cap add android`, gitignored build output)
index.html   redirect stub at the repo root — see "GitHub Pages" below
```

The game has no build step — `www/` is plain static HTML/CSS/JS and can be opened or served directly. The root `package.json`/`capacitor.config.json` exist only to wrap that folder for the Android build.

## GitHub Pages

GitHub Pages' simple "deploy from a branch" mode only serves from the repo root or a `/docs` folder — it doesn't know about `www/`. Rather than duplicate the game at the root, the root `index.html` is a one-line redirect stub into `www/index.html`, so Pages (root mode) keeps working with zero extra config. `www/` remains the single real copy of the game. (`.nojekyll` is also present at the root — without it, Pages runs everything through Jekyll, which can misbehave on a plain static site.)

## Running it in a browser

```
npm install
npm start
```

then visit `http://localhost:8000`. (Or just open `www/index.html` directly, or serve the `www/` folder with any static file server.)

## Building the Android app

```
npx cap add android      # first time only — requires Android Studio / SDK installed
npm run sync              # copy www/ changes into the native project
npm run android            # open the project in Android Studio to build/run
```

To regenerate native icons from `resources/icon.png` after changing the art:

```
npx capacitor-assets generate --android
```

## Rules summary

- Four piles: two ascending (start at 1, must play higher), two descending (start at 100, must play lower).
- **10 trick:** play a card exactly 10 lower on an ascending pile, or exactly 10 higher on a descending pile, to send it backward.
- Each turn, play at least 2 cards (1 if the draw pile is empty), then draw back up to your hand limit.
- Hand size: 8 cards for 1–2 players, 7 for 3, 6 for 4–5.
- Win by playing all 98 cards. Lose if a player can't make the required minimum plays.
