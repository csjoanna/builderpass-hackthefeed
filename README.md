# Hack the Feed · Builder Pass

Builder pass generator for the **Hack the Feed** AI video search hackathon — an
**Official Paris Creator Week side event** on **Saturday 7 November 2026** at
Albert School, Paris. Hosted by Oriane with Lovable, Albert School and Brut.

Attendees generate a personalised builder pass (photo + name + team + what
they're building) and export it in four social formats to post across X,
LinkedIn and Instagram.

**Live**: https://hack-the-feed.vercel.app

---

## What it does

Point a builder at the site, they:

1. Upload a photo, type their name, team, role and what they're building.
2. Pick a track (Video Search or Editorial).
3. Preview the pass in each platform's native aspect ratio with a tilt-reactive
   3D card.
4. Download a single PNG — or all four at once as a zip — and copy a
   platform-tailored post caption with the right @handles for each network.
5. Share directly via the native Web Share API (mobile) or via platform intent
   URLs with auto image download (desktop).

Four export formats, one shared brand language:

| Format     | Dimensions | Variant         | Social destination |
|------------|------------|-----------------|--------------------|
| X post     | 1600 × 900 | Horizontal pass | Twitter / X        |
| LinkedIn   | 1200 × 1200| Square pass     | LinkedIn           |
| IG post    | 1080 × 1080| Square pass     | Instagram feed     |
| IG story   | 1080 × 1920| Vertical pass   | Instagram story    |

---

## UX principles

### 1. The pass is the artwork

Every export is just the pass at the platform's aspect ratio. No marketing
chrome around it, no headlines bolted on. One object, four sizes. If a user
builds a great pass, every social surface shows the same great pass.

### 2. Preview = what you download

The tabbed preview renders the real `ExportStage` for the active format,
scaled to fit the preview card. What you see is a 1:1 of the PNG you'll get.
No surprises.

### 3. Progressive disclosure

The form is split into **You → Project → Photo**, each with its own hairline
divider. Photo controls (zoom / x / y / reset / remove) only appear after
upload. Character counters only appear where they matter.

### 4. One primary CTA at a time

The active-tab download button is the only lime-filled CTA in the preview
column — the "All 4 · ZIP" and "Share" buttons are quieter secondary styles.
Users always know which action is primary for the thing they're currently
looking at.

### 5. Platform-aware copy

The post-text composer swaps per active tab:

- **X**: ≤ 280 chars, @X_handles, 2 hashtags, 🎟️ emoji
- **LinkedIn**: ≤ 3000 chars, @LinkedIn names, structured paragraphs, 6 hashtags
- **IG post caption**: ≤ 2200 chars, @instagram.handles, 5 hashtags
- **IG story overlay**: ≤ 250 chars, short enough for a sticker

Live character counter is neutral under 90%, amber past 90%, red if over.
A red footer banner warns before posting if the user has gone over.

### 6. Fallback graceful share

Mobile → native share sheet with image + text (user picks IG / X / Messages).
Desktop → auto-download the image + open the platform's intent URL with the
caption pre-filled. Instagram desktop has no web intent, so it just downloads
the image for upload from the app.

### 7. Nothing is lost on refresh

`localStorage` persists everything except the photo blob (too large; falls back
to persisting without it if the quota is hit).

### 8. Accessibility by default

- `<label htmlFor>` + `useId()` for every form input
- `role="status" aria-live="polite"` on the download toast + character counter
- Lime focus-visible ring (`#c6ff3d`) on every interactive element
- `prefers-reduced-motion` guard disables the tilt and idle float
- Partner marks have `role="img"` + `aria-label`

---

## UI design system

### Palette

| Token      | Hex       | Role                                                      |
|------------|-----------|-----------------------------------------------------------|
| **Cream**  | `#f3efe6` | Pass surface, hosted-by band, LinkedIn export background  |
| **Ink**    | `#0a0a0a` | Primary text + dark pass stub + photo frame               |
| **Lime**   | `#c6ff3d` | Primary CTA, PCW side-event banner, Track chip, QR fg     |
| **Navy**   | `#121A3A` | Albert School brand ink                                   |
| **Disc**   | `#A8CFEE` | Albert School brand disc                                  |

### Typography

- **Sans**: Geist (hero titles, body)
- **Mono**: Geist Mono (eyebrows, labels, builder stub, chip text — gives the
  ticket/boarding-pass feel)
- Field label pattern: tracked `0.3em` uppercase mono at `11px`, opacity 60%

### Spacing

Loose 4 / 8 / 16 / 24 / 32 scale via Tailwind. Pass internals use absolute
positioning on an invisible 1200 × 680 grid (horizontal) / 1080 × 1080 (square)
/ 1080 × 1920 (vertical) so the layout stays pixel-exact at any render scale.

### Brand marks

- `OrianeMark`, `LovableMark`, `BrutMark` — real brand SVGs in `/public/logos/`
- `AlbertSchoolMark` — tries `/logos/albert-school.png`, falls back to
  `/logos/albert-school.svg`, falls back to an inline-SVG recreation so the
  component never breaks visually. Drop a new file in `/public/logos/` and the
  component picks it up automatically.
- `ParisCreatorWeekMark` — inline SVG stacked `PARIS / CREATOR / WEEK` wordmark
  with optional `boxed` prop that draws a thin outline frame + `OFFICIAL SIDE
  EVENT` subtitle (banner-faithful treatment).

### Partner tiers (per the official event banner)

- **Host**: Oriane (shown independently in the vertical pass top-left).
- **In partnership with**: Lovable, Brut, Albert School.
- **Co-presenting programme**: Paris Creator Week (shown as "OFFICIAL SIDE EVENT").

The `PartnerRow` component renders the three in-partnership marks with
`wrap={false}` and brand-correct heights (Lovable and Brut at 1.1×, Albert
School at 1.05× to balance perceived weight).

### Interactive 3D tilt

The preview card uses `perspective: 1600px` on the container and
`transform: rotateX/rotateY` on the pass driven by cursor position via CSS
custom properties (`--rx`, `--ry`, `--gx`, `--gy`). A lime specular glow
follows the cursor via `radial-gradient` + `mix-blend-screen`. On idle, a
6-second ease-in-out keyframe gives the pass a subtle "breathing" float.
All transitions respect `prefers-reduced-motion`.

---

## Tech

- **Next.js 16** (App Router, Turbopack, Node runtime, Cache Components)
- **React 19**
- **Tailwind CSS 4** (via `@tailwindcss/turbopack`)
- **html-to-image** — DOM → PNG for export rendering
- **qrcode.react** — inline SVG QR codes
- **JSZip** — "All 4 · ZIP" bundler
- **lucide-react** — icon set

No backend. Everything is client-rendered and client-exported. The site
deploys as fully static Next.js output.

---

## Project layout

```
app/
  page.tsx              # The one-page app: hero, form, preview, downloads
  layout.tsx            # Root layout + Geist fonts + metadata
  globals.css           # Tailwind + 3D tilt keyframes + reduced-motion guards
  icon.png              # Favicon
  components/
    Pass.tsx            # Three pass variants (Horizontal, Square, Vertical) +
                        #   shared helpers (StubField, Barcode, PhotoFrame,
                        #   ScaledContainer)
    ExportStage.tsx     # Thin wrapper that picks the right pass variant per
                        #   format for the download pipeline
    Brand.tsx           # All brand marks (Hack the Feed title, PartnerRow,
                        #   Oriane / Lovable / Brut / Albert School / PCW)
public/
  logos/                # Partner SVGs + Albert School PNG
  hack-the-feed-mark.png
```

---

## Running locally

```bash
npm install
npm run dev            # http://localhost:3000 (or set PORT=3017)
```

Type check:

```bash
npx tsc --noEmit
```

---

## Deploy

Linked to Vercel:

- **Live production**: https://hack-the-feed.vercel.app
- **Auto-aliased**: https://hackthefeed-five.vercel.app
- **Also aliased**: hackthefeedparis.vercel.app, hackthefeed-paris.vercel.app,
  hackthefeed2026.vercel.app, htf-paris.vercel.app

Deploy via:

```bash
vercel --prod
# then (until Git auto-deploy is wired):
vercel alias set <latest-deploy-url> hack-the-feed.vercel.app
```

---

## Credits

Built by [Joanna](https://www.linkedin.com/in/csjoanna/) with ♥.

Event hosts: Oriane · Lovable · Albert School · Brut.
Official side event of Paris Creator Week.
