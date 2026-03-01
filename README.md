# MODEL VS REALITY — Static SPA

This repository is a standalone, no-bundler single-page app that generates printable **MODEL VS REALITY** logic puzzles.

## Output structure

- `dist-standalone/index.html`
- `dist-standalone/app.js`
- `dist-standalone/styles.css`
- `dist-standalone/assets/`

## Puzzle rules implemented

- Exactly **3 categories** per puzzle: **Actors**, **Locations**, **Clashes**.
- Difficulty controls category size:
  - **Easy** = 3 items per category
  - **Medium** = 4 items per category
  - **Hard** = 5 items per category
- Labels appear in the **Legend** only.
- Puzzle areas (clues, grids, verdict board) are icon-first.
- Two-page print structure:
  - **Page 1**: briefing, legend, clues, and final verdict format
  - **Page 2**: deduction grids and icon verdict board
- **🦺 marker rule**:
  - Exactly one Clash receives the 🦺 marker.
  - The final verdict is the Actor + Location paired to that marked Clash.

## Controls

- Generate Easy
- Generate Medium
- Generate Hard
- Clear
- Reveal Solution
- Export/Print

## Run locally

Use any local static server. Example:

```bash
python -m http.server 8000
```

Then open:

- `http://localhost:8000/dist-standalone/index.html`

