# mvr-codex

MODEL VS REALITY puzzle project with two run modes:

## Restricted Mode (no dependency installation)
Use this mode in locked-down environments (for example npm registry returns HTTP 403).

### Option A: Open directly
Open `dist-standalone/index.html` in your browser.

For hosted preview tools that open repository root by default, `index.html` redirects automatically to `dist-standalone/index.html`.

### Option B: Serve with Python
```bash
python -m http.server 8000
```
Then visit:

- `http://localhost:8000/dist-standalone/index.html`

### Features in Restricted Mode
- Two-page A4 landscape printable layout (grayscale-friendly).
- Fixed **MODEL VS REALITY** title/subtitle and difficulty marker.
- Legend blocks with icon, short name, and BIM-neutral descriptions.
- Story and clue sections.
- Three icon-only deduction grids with click cycle: `blank → ❌ → ●`.
- Deterministic `Generate (Easy)` using a seeded RNG.
- `Export` via browser print (`window.print`) with print CSS for PDF export.

## Full Dev Mode (for environments with npm access)
If you have npm registry access, use the existing React/Vite source setup under `/src`:

```bash
npm install
npm run dev
```

> Full Dev Mode is optional in this environment; Restricted Mode is fully runnable without installs.
