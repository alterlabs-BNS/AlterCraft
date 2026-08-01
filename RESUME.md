# AlterCraft — Resume Point (paused 24 Jul 2026)

Paused mid-build to resume in ~4 hours. Everything below is **uncommitted** in the working
tree on branch `agent/high-end-site-imagery`. **Nothing deployed.** Dev server + background
audit are stopped.

## How to resume
1. Restart the dev server: preview `altercraft-dev` (port 3000).
2. Homepage in dev = `localhost:3000/` → redirects to the static flip deck `/home-flip.html`
   (the real homepage; old `Home.tsx` is retired). Ecom is at `/shop`.
3. Re-read this file + `NIGHT-HANDOFF.md` for the full picture.

## Prime directive from founder (latest)
**No old design anywhere — every page must wear the homepage flip theme** (cream #f8f4ee,
ink #1c1a17, wood accent #b3773c, Inter + Playfair, easing cubic-bezier(.76,0,.24,1)).

## DONE this session (all verified in dev, 0 console errors)
- **Homepage flip deck** is the real `/` in dev; Kitchen promoted to the **#2 screen**;
  top bar has **account icon + Sign in**; stats = `Best design / Made for you` + `Pan-India /
  Delivery & installation`; ticker/nav say **Custom Mattress**; title/meta swept to Pan-India.
- **Ecom section** (`/shop`): search + sort + filter, reusable **PDP** (`/shop/p/:slug`),
  localStorage **cart**, all **7 categories** populated (64 products) with correct cart-vs-quoted
  flows. Deep-link `/shop?category=<slug>` works.
- **Homepage → ecom wired**: every flip card → its PDP; every "Shop All" → filtered store.
- **Accounts** (`/account`, `/account/sign-in`, `/account/sign-up`): Supabase Auth (phone OTP +
  email), dashboard with orders/addresses; graceful until keys added.
- **Sitewide chrome re-themed** to the homepage design: rewrote `ElegantLayout` header/footer +
  new `src/styles/site-chrome.css` (cream/ink/accent, Playfair brand, sticky glass header, dark
  footer). This frames ALL React pages (shop, account, about, contact, service, local-SEO).

## IN-FLIGHT — verify first on resume
- **Chrome re-theme** compiles + renders with no errors, but I have NOT visually eyeballed it
  (screenshots weren't compositing). **First task on resume: load `/shop` + `/about`, screenshot,
  confirm the new header/footer look right on desktop + mobile; tweak spacing/contrast as needed.**

## NEXT — the per-page body restyle (the big remaining "no old design" work)
The shared chrome is themed, but page **bodies** (About, Contact, service/category pages,
`/products` gallery, policies, ~25 local-SEO pages) still use the old `elegant-site.css` look.
- I launched a read-only **audit workflow** to produce a per-page plan (align copy→Pan-India,
  relink CTAs→/shop, restyle+animate to homepage theme) — I **stopped it** at pause. Re-run it
  (`altercraft-page-sweep-plan`) or just proceed page-by-page.
- Founder decisions already set: do **all three** (align + restyle + animate); **keep** the local-SEO
  pages (align them, don't delete).
- Suggested order: About → Contact → service/category pages → `/products` gallery → policies →
  local-SEO template.

## BLOCKED ON FOUNDER (unchanged — activates the backend)
1. Supabase → SQL Editor: run `supabase/migrations/20260723120000_store_core.sql` then
   `20260723130000_seed_beds.sql`.
2. Copy anon key into `.env.local` (URL pre-filled; project ref `oxwldmynluytoowzasgw`).
3. Razorpay test keys for checkout (Phase 3, not built yet).
Once done, the store/accounts flip from local-data to live.

## Key files touched this session
- `public/home-flip.html` (stats, Custom Mattress, geo, Kitchen #2, cards→/shop/p, Shop All→/shop?category)
- `src/routes.tsx` (/ → flip redirect; /shop, /shop/p/:slug, /account* routes)
- `src/components/elegant/ElegantLayout.tsx` + `src/styles/site-chrome.css` (re-themed chrome)
- `src/pages/Shop.tsx`, `src/pages/ShopProduct.tsx`, `src/styles/shop.css`
- `src/pages/Account.tsx`, `src/lib/account.ts`, `src/styles/account.css`
- `src/lib/{supabase,catalogue,shopData,localCatalogue,cartStore}.ts`
- `supabase/migrations/*.sql`, `.env.example`, `package.json` (+@supabase/supabase-js, installed)

## Not yet built (later phases)
Cart page + checkout + Razorpay; order creation/webhook (edge fn); real phone-OTP SMS provider;
per-page animation; SEO fallback pages for /shop & /account.
