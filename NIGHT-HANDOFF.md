# AlterCraft — Overnight Handoff (Claude)

**Date:** 23 Jul 2026 (overnight) · **Branch:** `agent/high-end-site-imagery` · **Nothing deployed.**

You said "you have full control, complete everything" and went to sleep. Here's exactly what I did, what's safe, and the short list only *you* can finish. All changes are **uncommitted edits in the working tree** — review them before committing. **I did not push and did not deploy** (a real live site shouldn't go out unsupervised).

---

## 1. What I changed tonight

### Workstream A — content alignment (homepage is `public/home-flip.html`, the static flip page that postbuild swaps into `/`)
| File | Change | Verified |
|---|---|---|
| `public/home-flip.html` | **Stats row (A1):** `40 / Designer bed styles` → **`Best design / Made for you`**; `Delhi NCR / Primary service area` → **`Pan-India / Delivery & installation`** | ✅ rendered |
| `public/home-flip.html` | **Custom Mattress (TBD-5):** ticker + nav + flip-screen renamed `Mattresses`/`Mattress Planning` → **`Custom Mattress`** | ✅ rendered |
| `public/home-flip.html` | **Geo sweep (A2):** `<title>`, meta description, `og:title`, `og:description` — dropped "in Ghaziabad / Delhi NCR" framing → Pan-India; kept the store address as a fact | ✅ title rendered |
| `scripts/seoMetadata.mjs` | Mirrored the new default title/description so the SEO source of truth matches | — |

**Why this is deploy-safe:** the SEO gate (`scripts/check-seo.mjs`) only *equality-checks* the homepage's `robots` and `canonical` — I left both untouched (`index, follow` / `https://www.altercraft.in/`). Title/description only need to be present, which they are.

### Workstream B — the Supabase foundation (new files, nothing wired into live components yet)
| File | What it is |
|---|---|
| `supabase/migrations/20260723120000_store_core.sql` | Full store schema: catalogue, accounts/RBAC, cart, orders, coupons, durable leads + RLS on all 14 tables + `validate_coupon()`. Seeds the 7 categories with the flow map. |
| `supabase/migrations/20260723130000_seed_beds.sql` | All **40 beds** (AC-BED-001..040) as catalogue rows + images, mirroring `src/data/beds.ts`. |
| `src/lib/supabase.ts` | Shared Supabase client from env (`null`-safe until keys exist). |
| `src/lib/catalogue.ts` | Typed read layer: `getCategories`, `getCategoryBySlug`, `getProducts`, `getProductBySlug`. |
| `src/lib/leads.ts` | `createLead()` — durable lead capture (fixes the audit's localStorage-only leads). |
| `.env.example` | Template for the 2 Supabase values + Razorpay key id. |
| `package.json` | Declared `@supabase/supabase-js` (NOT installed yet — see below). |
| `.mcp.json` *(in the outer `AlterECO/` folder)* | Supabase MCP config (auth still pending on your side). |

---

## 2. What ONLY YOU can do (these unblock everything)

1. **Run the SQL** (2 min, no CLI): Supabase Dashboard → **SQL Editor** → run `store_core.sql`, then `seed_beds.sql`. Both are re-runnable.
2. **Install the dep:** in `AlterCraft/`, run `npm install`. *(I declared `@supabase/supabase-js` but deliberately did not run install — your `package.json` has wildcard version ranges, and I didn't want npm bumping other packages while you sleep.)*
3. **Add your keys:** copy `.env.example` → `.env.local`, paste the **anon key** from Supabase → Settings → API. (Project URL is pre-filled.)
4. **Razorpay:** create the account + generate **test** keys when you're ready for checkout (Phase 3).
5. **Supabase MCP auth** (optional convenience): the `/mcp` OAuth still needs a real interactive terminal on your side. Not required — the SQL-Editor path above doesn't need it.

---

## 3. Review → commit → deploy (when you're awake)

Nothing is committed. To review and commit (run in `AlterCraft/`):
```bash
git diff -- public/home-flip.html scripts/seoMetadata.mjs package.json
git add public/home-flip.html scripts/seoMetadata.mjs package.json supabase/ src/lib/ .env.example NIGHT-HANDOFF.md
git commit -m "feat: Pan-India homepage copy + Custom Mattress + Supabase store foundation"
```
*(If `.env.example` is gitignored, `git add -f .env.example`. If the pre-commit guard trips on unrelated tree junk, the staged set above is narrow and clean.)*

**Deploy is your call.** Live deploys from `main` (you're on `agent/high-end-site-imagery`). When you want it live, merge to `main` and push — CI runs `build` → `seo:check` → publishes to `gh-pages`. Say the word and I'll walk the merge/deploy with you.

---

## 4. Open decisions waiting on you
- **Custom Mattress flow:** currently seeded as `cart`. Its homepage screen still reads "ask for size quote." Cart-with-variants (sizes/firmness) or quoted? One-line flip either way.
- **Nav unification (A4):** homepage nav is now the extended taxonomy, but the React pages (`/products`, `/beds`, service pages) still use the older service nav (Kitchen/Wardrobes/Beds/Doors/Gallery/Contact). Unifying touches many components — I left it for a supervised pass.
- **TBD-9 local SEO:** ~25 Ghaziabad/Noida landing pages untouched (as agreed). Keep for search or retire as brand goes Pan-India?
- **A3 anchor pricing / A6 background / A7 motion:** not started.

## 5. Suggested next order
1. You: run SQL + `npm install` + keys → confirms the foundation live.
2. Me (next session): wire `/beds` to read from Supabase catalogue + build the reusable Amazon-style PDP template.
3. Me: cart → checkout → Razorpay (test) → order records → coupons — the Beds launch-gate slice.
4. Replicate to the other categories; then accounts (phone OTP), then harden + go live.

Sleep well — the foundation's in place and nothing risky was shipped.
