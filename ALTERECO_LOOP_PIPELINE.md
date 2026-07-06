# AlterECO Loop Closure Pipeline

Status date: 2026-07-03

This pipeline closes the current AlterECO loop without blocking the ongoing Contractor Desk / OperatorDesk work. Treat Contractor Desk as the partner-facing B2B entry point and OperatorDesk as the internal control lane. The closure target is to turn the repo from active proof into a clean release unit with a known next backend path.

## North Star

AlterECO closes when these are true:

1. The public AlterCraft site is clean, buildable, and deployable.
2. Beds storefront and current revenue assets are either shipped or explicitly parked.
3. Contractor Desk / OperatorDesk has a stable current artifact and a documented backend path.
4. The repo has a clean commit boundary, with generated artifacts handled deliberately.
5. The next 30-day doctrine dashboard can run from OperatorDesk, Contractor Desk backend data, or a clearly named interim sheet/dashboard.

## Updated Doctrine

AlterCraft is now being positioned as a complete infra execution partner.

The simple external line:

> Partners bring the project. AlterCraft executes the work with labour, material, manufacturing, robotics, site proof, payment discipline and handover control.

This covers exterior execution, interior fitout, modular manufacturing, robotics and site automation, civil and block work, concrete and base work, finishing and handover work.

Partner types:

- designers,
- architects,
- builders,
- developers,
- realtors and estate partners,
- contractors without their own manpower, factory or site-control setup.

Product doctrine:

- Contractor Desk is the clean partner-facing app.
- OperatorDesk is the private internal control app.
- Capital Desk is the self-owned finance/compliance control layer.
- Robotics is a future execution layer for assisted manufacturing, site measurement, proof capture and repeatable production automation.
- Central DB work has started locally with SQLite and a Node API.
- GitHub is for code and docs, not live customer/project records.
- Hosted DB is the next infrastructure decision, with Supabase as the preferred first free test path unless requirements change.
- No fake backend, fake upload, fake login, fake automation or cloud-sync claims.
- No robotic execution claims until the hardware, operator SOP, safety process and proof flow exist.
- No internal version labels or jargon in customer-facing copy.
- No intelligent outsourcing: AlterCraft owns the books, GST math, tax reserve and proof logic; outside professionals only validate, sign or file where law requires it.

The full doctrine lives in `docs/ALTERCRAFT_DOCTRINE.md`.

## Parallel Lane: Contractor Desk / OperatorDesk

You are already working on this in parallel. Keep it moving, but do not let it block the release hygiene lane unless it breaks the public site or APK download.

Current acceptance for this lane:

- Keep the current Contractor Desk APK handoff stable: `public/downloads/contractor-desk-debug.apk`.
- Keep `/ContractorDesk` as the public product story and controlled APK access page.
- Keep `/operator-desk/*` as noindex internal app routes.
- Keep customer-facing app language plain: project, proof, money, drafts, partner, execution.
- Do not claim secure live accounts or cloud storage until hosted DB, login and deployment are actually live.
- Use the local JSON server and local SQLite server as controlled prototypes, not final production infrastructure.

## Phase 0 - Freeze The Scope

Goal: stop the loop from expanding while closure happens.

Do now:

- Freeze new UI/features except active OperatorDesk work.
- Label current work as one release wave: `AlterECO public revenue + Contractor Desk execution wave`.
- Decide what is in the wave:
  - Beds storefront.
  - Contractor Desk public page and APK story.
  - OperatorDesk route/app shell.
  - Central DB foundation and backend runbook.
  - SEO/blog/indexing updates.
  - Current proof PDFs/banners.
- Decide what is out of the wave:
  - Hosted Supabase/full backend.
  - Public mass-market APK rollout.
  - More design exports.
  - New product fronts.

Exit gate:

- A single commit/release name exists.
- Anything not inside the wave is parked in archive or left untracked intentionally.

## Phase 1 - Repo Hygiene

Goal: turn the dirty repo into an understandable release boundary.

Tasks:

1. Run `git status --short` and group changes into:
   - source changes,
   - generated build changes,
   - public assets,
   - proof/output assets,
   - design handoff folders,
   - temporary logs/cache.
2. Decide the `build/` policy:
   - Preferred: stop tracking `build/` and rely on GitHub Actions to publish from `npm run build`.
   - If keeping tracked build files: document that `build/` is a published-source artifact and always regenerate it before release.
3. Keep versioned APK files; remove or commit deletion of stale unversioned APK files deliberately.
4. Move old design exports and ZIPs into archive if they are no longer active sources.
5. Keep proof PDFs/banners in `output/` only if they are business assets; otherwise archive them outside the release commit.

Exit gate:

- Dirty tree is either clean or intentionally grouped into one release commit.
- No accidental generated churn is mixed with source work without a policy.

## Phase 2 - Public Revenue Lane

Goal: make the visible AlterCraft site earn attention and enquiries.

Tasks:

1. Verify `/beds` has:
   - 40 bed images,
   - starting-price clarity,
   - hydraulic-extra disclaimer,
   - WhatsApp shortlist flow,
   - JSON-LD product/list data.
2. Verify core service pages still carry the modular-kitchen pricing stance.
3. Verify public navigation does not expose internal/admin surfaces except intentionally.
4. Keep phone and WhatsApp consistent: `+91 88175 03658` and `https://wa.me/918817503658`.
5. Confirm generated blog/indexing assets are in sync.

Exit gate:

- `npm.cmd run seo:check` passes.
- Public site has no broken primary route for `/`, `/beds`, `/ContractorDesk`, `/contact`, and key service pages.

## Phase 3 - Backend Boundary

Goal: make the current backend state honest and ready for the next sprint.

Tasks:

1. Keep the Contractor Desk central DB foundation documented:
   - schema: `server/db/schema.sql`;
   - DB access: `server/centralDb.mjs`;
   - API server: `server/centralDbServer.mjs`;
   - runbook: `docs/contractor-desk-central-db.md`.
2. Align the local JSON server data model with the frontend `OperatorDeskState` types.
3. Confirm first-account `L3 Founder` flow, later public signup `L1 Worker` flow, and Team Control `L2/L1` creation.
4. Remove or clearly label offline fallback behavior:
   - current offline fallback signs in as `L3 Founder`;
   - acceptable for private device prototype;
   - risky if presented as real live-account security.
5. Decide hosted backend direction:
   - short sprint: local SQLite and JSON servers only for demo;
   - real sprint: Supabase/Postgres or Express/Postgres with auth;
   - alternative: Cloudflare Workers + D1 if the app stays simple and serverless.
6. Do not store live sensitive cash/client data in device-only mode.

Exit gate:

- Backend limitation is visible in docs and UI copy where needed.
- Server seed/bootstrap shape does not conflict with frontend typed state.
- Team/user management behavior is tested with local server.
- Contractor Desk project-create API can write and list projects in the central DB.
- Capital Desk doctrine is reflected in ledger docs before any finance/compliance UI claims are made.
- Robotics doctrine is reflected before any robotics UI, sales copy or asset tracking claim is made.

## Phase 4 - QA And Release Gates

Goal: prove the release is safe enough to ship.

Minimum commands:

```powershell
npm.cmd audit --audit-level=high
npm.cmd run seo:check
node scripts/altereco-release-gates.mjs
```

Recommended full release command:

```powershell
npm.cmd run build
npm.cmd run seo:check
node scripts/altereco-release-gates.mjs
```

Manual browser checks:

- `/`
- `/beds`
- `/ContractorDesk`
- `/downloads/contractor-desk-debug.apk`
- `/operator-desk/dashboard`
- `/contact`
- `/blog/`

Exit gate:

- Audit passes.
- SEO check passes.
- Release gate script has no FAIL rows.
- Manual routes render on desktop and mobile widths.

## Phase 5 - Commit And Publish

Goal: make the release recoverable.

Tasks:

1. Commit source and intentional public assets.
2. Commit generated files only according to the `build/` policy.
3. Push to `main`.
4. Let GitHub Actions publish to `gh-pages`.
5. Verify live site after deployment lag.

Suggested commit shape:

```text
Close AlterECO public revenue and Contractor Desk execution wave
```

Exit gate:

- GitHub Action passes.
- Live site renders.
- APK link works.
- The repo is clean or only has deliberately ignored local artifacts.

## Phase 6 - 30-Day Doctrine Dashboard

Goal: convert the doctrine from document into operating rhythm.

Minimum dashboard fields:

- new partner requests,
- quoted project value,
- token amount expected,
- cash collected this week,
- pending payment reduced,
- sites closed,
- labour dependency reduced,
- material purchases controlled,
- manufacturing jobs started or closed,
- robotics/automation experiments shipped,
- tool or machine ROI tracked,
- proof assets created,
- SOPs written,
- Contractor Desk / OperatorDesk modules built,
- backend endpoints shipped,
- sleep hours protected,
- hard conversations completed,
- decision latency reduced.

Exit gate:

- The weekly dashboard exists in OperatorDesk, a sheet, or a clearly named interim doc.
- Every active site/job has owner, payment gate, next action, and proof status.

## Decision Matrix

| Area | Close Now | Keep Parallel | Park |
| --- | --- | --- | --- |
| Public website | Yes | No | No |
| Beds storefront | Yes, if images/pricing are verified | No | Only if quality is not ready |
| Contractor Desk page | Yes | Product messaging can keep improving | No |
| OperatorDesk app | Keep artifact stable | Yes, active lane | No |
| Local central DB | Yes, foundation and runbook | API shape can improve | No |
| Hosted backend | No | Supabase/Neon/Cloudflare decision and migration plan | Full production build if it delays release |
| AlterOS repo | No | Prepare after release | Yes until current loop closes |
| Extra design exports | No | Only if directly used | Yes |

## Current Known Blocks

- Dirty tree has a large mixed wave of source, public, build, output, and handoff changes.
- `build/` is ignored but also tracked in git history, creating noisy generated diffs.
- Local JSON server data shape is behind the current frontend model.
- Local SQLite central DB is a development foundation, not hosted production infrastructure.
- Offline fallback gives local `L3 Founder` access, which is useful privately but not a production security story.
- OperatorDesk/Contractor Desk product is promising, but live backend claims must stay conservative.

## Done Definition

The AlterECO loop is done when the release can be explained in one sentence:

> AlterCraft public revenue pages, Contractor Desk partner app, OperatorDesk control assets and the central DB foundation are shipped cleanly, with the hosted backend sprint documented and no hidden repo mess.
