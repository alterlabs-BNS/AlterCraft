# AlterCraft Revamp — Handoff

Continuation note for Claude Code (or any engineer) picking up the website
revamp. Read this, then continue per the phased plan in
`../AlterCraft-Website-Revamp-Plan.pdf` (and `../AlterCraft-Website-Audit.md`).

**Repo root:** this folder (`AlterCraft/`) — a Vite + React 18 + react-router
app. `npm run dev` to preview, `npm run build` to build, `npm run seo:check`
for the SEO gate.

---

## Golden rule for this revamp

**Presentation only. Do NOT damage SEO or content.** Do not change page copy,
`<title>`, meta descriptions, `keywords`, JSON-LD (`jsonLd`/schema), canonical
tags, routes, sitemap, or image `alt` text unless a task explicitly calls for
it. Restyle via CSS and presentational markup. The programmatic SEO (127 unique
titles / 126 unique descriptions across ~130 pages, LocalBusiness schema, valid
sitemap) is the site's strongest asset — protect it.

The one intentional content change so far: the homepage `<h1>` was rewritten
from the abstract *"Imagine your space. Build it with AlterCraft"* to the
keyword-relevant *"Custom & modular furniture, built to your exact space."*
This was an approved part of the hero rewrite and improves SEO. Page `<title>`
and meta are unchanged.

---

## Design system (target tokens — already in the code)

Use these; do not introduce new colors. Defined in `src/styles/elegant-site.css`
(forest theme `:root` block) and re-declared locally where noted.

- Surfaces: Ivory `#fff7e7`, Paper `#f8f1e5`, Stone `#ede0ce`, card `#fffdf9`
- Accent / CTA: Copper `#d8a35f`, Copper-soft `#f0c987`, Copper-deep `#9e641f`
- Dark / text: Forest 900 `#061f17`, Forest 800 `#0d3327`, ink `#23180f`,
  secondary brown `#5f3b23`
- Type: Playfair Display (`--font-heading`) for display/headings, Inter
  (`--font-body`) for everything functional. Loaded via `@import` in
  `src/index.css`.
- Radii: 8 (controls) · 14 (buttons/cards) · ~18–20 (feature panels)
- Spacing: 4px grid. Breakpoints: 480 / 768 / 1024 / 1280.

---

## What's already done (this pass)

Three files touched — verify with `git diff`:

1. **`src/components/HeroPoster.tsx`** — full hero rewrite. Active hero on the
   homepage (rendered by `src/pages/Home.tsx`). Now: one Playfair `<h1>`,
   one-line subhead, `₹1,200 / sq. ft.` price band, single copper CTA
   ("Get a Free Quote" → WhatsApp) + tap-to-call, a **touch-friendly category
   tab switcher** (replaces the old hover-only carousel — swaps the bg image on
   tap), a trust row, and a **desktop-only right-column "site → design preview →
   installed" journey visual** with a "150 km reach" badge. Uses existing data
   (`siteDetails`, `modularKitchenStartingPrice`, `createWhatsappLink`).

2. **`src/styles/home.css`** — two appended blocks at the end:
   - `AC Hero` block (`.ac-hero*`) — mobile-first hero styles + showcase +
     media queries.
   - `AC Refined-Premium Makeover Layer` — scoped to `.home-site`; elevates
     section headers/kickers, buttons, all card types (offer/feature/process/
     step/blog), category & portfolio tiles (gradient labels + image zoom),
     trust strip, material/warranty/testimonial/final-CTA bands, contact/quote.

3. **`src/styles/elegant-site.css`** — appended `AC Refined-Premium Makeover`
   block targeting the shared `elegant-*` classes used by the ServicePage
   template (`src/components/elegant/ServicePage.tsx`) and therefore the ~90
   city/service landing pages (`src/pages/LocalServicePages.tsx`,
   `src/pages/servicePages.tsx`): forest-scrim hero, copper price-strip band,
   copper CTAs, lifting cards with image zoom.

**Verified:** brace balance OK (home.css and elegant-site.css both balanced);
all classes referenced by `HeroPoster.tsx` exist in CSS. NOT yet verified in a
real browser — see below.

---

## First thing to do: verify in a real browser

This work was done in an environment without a headless browser, so the live
React render was not screenshot-verified. Please:

1. `npm run dev`, open the homepage, check the hero at desktop / 1024 / mobile
   widths (the right-column showcase should show ≥1025px only and hide below).
2. Spot-check a landing page (e.g. `/modular-kitchen`, `/modular-kitchen-noida`)
   for the elevated `elegant-*` styling.
3. Confirm no visual regressions on the footer / mobile bottom nav (they share
   `elegant-*` classes).
4. `npm run seo:check` should still pass unchanged.

Note: the old `.hero-poster*` CSS in `home.css` (~477 lines) is now **dead
code** — the rewritten hero uses `.ac-hero*`. Safe to delete during Phase 1 CSS
consolidation, not before.

---

## Remaining work (per the plan's phases)

### Phase 0 — quick wins (finish these next)
- [ ] Trim top nav from 11 → ~6 customer items (Kitchens, Wardrobes, Beds,
      Doors, Gallery, Contact). Give Contractor Desk its own entry outside the
      public nav. Nav is `NAV_LINKS` in `src/pages/Home.tsx` and the
      `elegant-nav` in `src/components/elegant/ElegantLayout.tsx`.
- [ ] Sticky mobile call/quote bar.
- [ ] Remove 128 MB debug APKs from the web deploy
      (`build/downloads/*.apk`, `public/downloads/*.apk`). A
      `scripts/remove-build-apks.mjs` already exists — wire it into deploy.
- [ ] Convert the two ~2 MB blog cover PNGs to WebP
      (`cnc-interiors-cover.png`, `wardrobe-storage-cover.png`).
- [ ] Add font `preconnect` (or self-host) — currently `@import` in
      `src/index.css` with no preconnect.
- [ ] Fix schema fields: `"legalName": "Ranjeet"` and `"priceRange": "Rs"`.
      Drop the legacy `keywords` meta tag.

### Phase 1 — design-system foundation
- [ ] Consolidate the 3 clashing styling systems / delete dead CSS (incl. old
      `.hero-poster*`). Promote the tokens above into one source of truth.

### Phase 2 — homepage revamp
- [ ] Mostly done (hero + section makeover). Remaining: section-scale variety,
      remove any leftover empty vertical gaps, wire the sticky quote bar.

### Phase 3 — templates & pages
- [ ] Beds storefront, gallery/portfolio, blog measure (65ch, 17px base),
      forms (single field style, 44px tap targets, copper submit).

### Phase 4 — rendering & SEO
- [ ] Pre-render / static-generate every route (biggest SEO win — pages
      currently ship an empty `<div id="root">`).
- [ ] Add Product / Service / FAQ / BreadcrumbList schema; per-page OG images.

---

## Working style
- Small, reviewable commits. The user reviews before deploying.
- After CSS edits, sanity-check brace balance and that referenced classes exist.
- Keep everything on the copper/forest/ivory system; no new palettes.
