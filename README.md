# Brand Drift Score — Embeddable SPA

A lightweight, no-backend Single Page Application that runs a strategic **Brand Drift Score** diagnostic in under 3 minutes.

## Files

- `dist-standalone/index.html`
- `dist-standalone/styles.css`
- `dist-standalone/app.js`

## What the app includes

- 9-question, one-question-per-screen flow.
- Mixed answer types: radio choices and 1–5 sliders.
- Progress indicator with percentage.
- Score normalization to 0–100.
- Result categories:
  - `80–100`: Stable
  - `60–79`: Early Drift
  - `40–59`: Fragmented
  - `0–39`: Critical Drift
- Dynamic diagnosis and 3 dynamic key observations.
- Fixed strategic insight line.
- Restart flow.
- Mobile responsive layout.

## Run locally

```bash
python -m http.server 8000
```

Open:

- `http://localhost:8000/dist-standalone/index.html`

## Embed in Squarespace

### Option A: iframe (recommended)

1. Host the `dist-standalone` folder on any static host (see options below).
2. Copy the deployed page URL (for example: `https://yourdomain.com/brand-drift/index.html`).
3. In Squarespace, add a **Code Block** and paste:

```html
<iframe
  src="https://yourdomain.com/brand-drift/index.html"
  width="100%"
  height="860"
  style="border:0; max-width: 760px; margin: 0 auto; display:block;"
  loading="lazy"
  title="Brand Drift Score Diagnostic"
></iframe>
```

4. Adjust `height` if needed.

### Option B: direct HTML/CSS/JS in a Code Block

If your plan/setup allows custom code with script tags, you can copy the contents of:

- `dist-standalone/index.html` body markup
- `dist-standalone/styles.css`
- `dist-standalone/app.js`

Wrap CSS in `<style>` and JS in `<script>` inside the block.

## Hosting options (static)

- **Cloudflare Pages**: drag-and-drop `dist-standalone` or connect repo.
- **Netlify**: deploy `dist-standalone` as publish directory.
- **GitHub Pages**: publish `dist-standalone` from branch/folder.
- **S3 + CloudFront**: upload files as static site.

No backend, storage, or integrations are required.
