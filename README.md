# The Game — clone

A browser-based clone of *The Game*, the cooperative card game by Steffen Benndorf. Play cards 2–99 onto four piles — two ascending from 1, two descending from 100 — using the "exactly 10 back" trick to reverse a pile's direction. Supports 1–5 players in local pass-and-play mode.

## Running it

No build step or dependencies. Open `index.html` directly in a browser, or serve the folder with any static file server, e.g.:

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## Rules summary

- Four piles: two ascending (start at 1, must play higher), two descending (start at 100, must play lower).
- **10 trick:** play a card exactly 10 lower on an ascending pile, or exactly 10 higher on a descending pile, to send it backward.
- Each turn, play at least 2 cards (1 if the draw pile is empty), then draw back up to your hand limit.
- Hand size: 8 cards for 1–2 players, 7 for 3, 6 for 4–5.
- Win by playing all 98 cards. Lose if a player can't make the required minimum plays.
