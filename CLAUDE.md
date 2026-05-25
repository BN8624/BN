# CLAUDE.md — AI SOP OCR

## Project Overview

**AI SOP OCR** is a single-file, self-contained browser application (`sop008.html`) that extracts transaction data from Korean credit card statements (PDF or image files) using the Google Gemini AI vision API. Extracted rows are exported to Excel (`.xlsx`) or shown in a preview table.

The app is written entirely in a single HTML file with inline React (via Babel Standalone), Tailwind CSS, and CDN-loaded libraries. It is deployed to GitHub Pages automatically on every push to `main`.

**Primary language of the codebase and user-facing text: Korean (한국어).**

---

## Repository Structure

```
BN/
├── sop008.html               # Entire application — one file
└── .github/
    └── workflows/
        └── static.yml        # GitHub Pages deployment workflow
```

There is no build step, no `package.json`, no dependencies to install.

---

## Tech Stack (all via CDN)

| Library | Version | Purpose |
|---|---|---|
| React | 18.2.0 | UI framework |
| ReactDOM | 18.2.0 | DOM rendering |
| Babel Standalone | 7.23.2 | In-browser JSX transpilation |
| PDF.js | 3.11.174 | PDF rendering to canvas |
| XLSX.js | 0.18.5 | Excel export |
| Tailwind CSS | (latest CDN) | Utility styling |
| Google Fonts | IBM Plex Mono + IBM Plex Sans KR | Typography |

The AI model is **Google Gemini `gemini-3.1-flash-lite`** via the Vertex AI endpoint (`aiplatform.googleapis.com`). The user supplies their own Vertex AI API key at runtime.

---

## Application Architecture

### Core Pipeline (v0.08 — 1-Pass Image)

1. **File Input** — Drag-and-drop or file picker accepts PDF/image files
2. **PDF Rendering** — PDF.js renders each PDF page to an HTML Canvas
3. **Adaptive Preprocessing** — Brightness of the content area (15–50% vertical range) is sampled; contrast/brightness filters are applied dynamically:
   - Dark (`< 85`): contrast 1.8 × brightness 1.3
   - Medium (`85–170`): contrast 1.5 × brightness 1.1
   - Bright (`> 170`): contrast 1.3 × brightness 1.0
4. **Image Encoding** — Canvas is encoded as WebP (if supported) or JPEG Base64
5. **API Call** — Each page image is sent to Gemini as `inlineData`
6. **Page-1-First Strategy** — Page 1 is processed alone first to detect and lock the column headers (`globalHeaderRef`); pages 2+ are processed in parallel with the confirmed header injected as a prompt hint
7. **Parsing** — Responses are parsed as JSON Lines (primary) with a tab-delimited fallback
8. **Review Columns** — Conditions A (missing amount), B (data loss), C (duplicate row) are flagged
9. **Export** — Data is downloaded as `.xlsx` or as a text report

### Key Constants (`CONFIG`)

```js
GEMINI_URL: "https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-3.1-flash-lite:generateContent"
TIMEOUT_MS: 180000       // 3-minute per-request timeout
MAX_RETRIES: 4
CONCURRENCY_LIMIT: 2     // max parallel API calls
LIMIT_RPM: 10            // Vertex AI quota
LIMIT_TPM: 250000
LIMIT_OUTPUT_TOKENS: 65535
WARN_RPM: 9              // warning thresholds (UI indicators)
WARN_TPM: 230000
WARN_OUTPUT_TOKENS: 60000
```

### Rate Limiting — `SlidingWindowQueue`

A sliding-window queue enforces **8 requests per 60 seconds** (`LIMIT_RPM - 2` buffer) to stay within the Vertex AI quota. The queue blocks new requests until capacity is available and logs a countdown to the UI.

### Persistence — `useDB` hook + IndexedDB

Extracted rows survive page reloads via IndexedDB (`AI_SOP_OCR` database, `data` store). The `useDB(key, init)` hook reads on mount and writes on every update.

### Output Parsing — `parseRawText`

1. Scans all lines for JSON objects (`{...}`) → builds a row array keyed by column header names
2. Falls back to tab-split lines if JSON yield is 0
3. Filters summary/total rows (`소계|합계|총합|총계`)
4. Validates rows by requiring at least one date-pattern value (`\d{2,4}[.\-\/]\d{1,2}`)

---

## Development Conventions

### File & Version Naming

- The application file is `sop{VERSION}.html` (e.g., `sop008.html`)
- `VERSION_CODE = '008'` inside the file controls the version string used in filenames
- Downloaded output files are stamped: `sop008_YYYYMMDD_HHMM.xlsx`
- When releasing a new version, **create a new file** (e.g., `sop009.html`) rather than renaming the existing one; old versions may be deleted from the repo afterward

### Patch Notes Format

Every version's top-of-file comment block includes:
- What changed in this version
- Experiment records (what was tried and why it failed) for abandoned approaches
- Architecture overview for the current approach

Preserve this format when updating the file — it serves as the changelog.

### Abandoned Approach: Native PDF (v0.07)

v0.07 tried sending PDF pages as `application/pdf` Base64 directly to the API (bypassing Canvas rendering). Results were worse for documents without explicit table borders (row extraction dropped from 509 → 505 or lower). The image-based approach is definitively superior and must not be reverted.

### Prompt Engineering (`EXTRACT_PROMPT` / `EXTRACT_PROMPT + headerHint`)

- The system prompt instructs Gemini to output one JSON object per row, using actual column header names as keys
- Empty cells must be **omitted entirely** (not set to `""`) to avoid column-shift errors
- The first output line must be a JSON array of column headers
- For pages 2+, the confirmed header array is injected as a `headerHint` to prevent Gemini from inventing headers

Do not change the output format (JSON Lines) without updating `parseRawText` accordingly.

### UI / Styling

- Background: `#d6e8df` (sage green)
- Accent: `#1e6644` (dark green)
- Warning: `#c0392b` (red)
- Font: IBM Plex Sans KR (UI) + IBM Plex Mono (code/values)
- All custom CSS is in the `<style>` block; Tailwind handles layout

---

## Deployment

The app is deployed automatically to **GitHub Pages** on every push to the `main` branch via `.github/workflows/static.yml`. The workflow uploads the entire repository root as the Pages artifact, so `sop008.html` is served at the root URL.

No build step is required — the file is ready to serve as-is.

---

## Common Tasks

### Update the Gemini model

Change `CONFIG.GEMINI_URL` on line ~153. Remember to re-verify accuracy against a known-good test document (see the v0.07 experiment for benchmark methodology: count extracted rows vs. manual count).

### Bump the version

1. Copy `sop008.html` → `sop009.html`
2. Update `VERSION_CODE = '009'` and the `<title>` / header comment
3. Update `CONFIG.GEMINI_URL` if changing models
4. Add a patch note comment block at the top of the `<script>` section
5. Commit and push to `main`; the old file can be deleted

### Change rate limits

Edit `CONFIG.LIMIT_RPM` and `CONFIG.WARN_RPM`. The `SlidingWindowQueue` is instantiated with `limit: 8` (hardcoded as `LIMIT_RPM - 2`); update both if changing the quota.

### Add a new review condition

The system review columns (A/B/C) are computed after parsing. Search for `isRealMoney` and the condition-check logic near the review column section to add a new flag.

---

## What NOT to Do

- Do not add a build system or `package.json` — the entire value of this project is zero-dependency, single-file deployability
- Do not switch back to native PDF mode — this was thoroughly tested in v0.07 and found inferior
- Do not increase `CONCURRENCY_LIMIT` above `2` without verifying against the Vertex AI RPM quota
- Do not remove the page-1-first strategy — it prevents header-detection failures on multi-page documents
- Do not commit API keys — users supply their own key at runtime via the UI input field
