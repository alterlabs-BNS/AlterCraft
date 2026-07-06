# Contractor Desk APK Pipeline

## Page Flow

1. Welcome: position Contractor Desk as AlterCraft's B2B infra execution partner app.
2. Signup: capture partner role, name, phone, company and city.
3. Service: choose civil/block, concrete, exterior, interior fitout, modular manufacturing or finishing.
4. Execution type: choose labour-only, material-only, labour plus material, turnkey or white-label execution.
5. Project area: enter approximate sq ft, property type, start window, material grade and notes.
6. Estimate: show indicative sq ft rate, project range, token amount and timeline.
7. Placed: create a request ID and prepare the WhatsApp order summary for AlterCraft confirmation.

## App Build Scope

1. Create project request: save partner details, scope, area, execution type and estimate.
2. Track projects: show active work, value, payment gate, proof gaps and next action.
3. Add site proof: save proof records with actor, type, file names, notes and approval state.
4. Track money: separate received cash, receivables, material, labour, supervision and reserve buckets.
5. Create message drafts: generate work-order, vendor, client and content text from a project note.

## Current Guardrails

- Quick-start presets for designer white-label, builder labour and developer turnkey scenarios.
- Readiness scoring blocks request placement when contact details or valid area are missing.
- Area presets and a "Not sure" survey assumption help confused customers move forward without corrupting the quote.
- Service selection keeps the chosen lane, execution model, rate and next action visible so dense mobile choices do not bury the flow.
- Request and command screens reset page and internal scroll on step changes so the next view does not open halfway down.
- Project intake can add removable local scope-evidence signals such as BOQ available, photos available or survey needed without claiming cloud upload.
- Estimate shows an indicative cost split by execution model so partners understand what the sq ft quote is paying for.
- Placed orders show handoff readiness, contact/scope/note/payment status and the next missing action for the partner.
- Placed orders show the next execution sequence: scope call, files/survey, payment gate and proof-led work.
- Placed orders can copy the full order brief for sharing outside WhatsApp.
- If clipboard copy is blocked, placed orders show a manual-copy fallback with the full local order brief.
- Operator cards show contact, file, payment and proof readiness chips for faster bulk handling.
- Project tracker can search projects and filter by payment gate for bulk partner handling.
- Project tracker includes local triage filters for missing contact, scope evidence, token and proof bottlenecks.
- Site proof recipe chips can prefill proof type and note text for faster local proof creation.
- Cash envelope blocks over-allocation and can clear the next pending token locally.
- Money tracker shows the next token gate and quick local cash allocation presets before the user locks money into a bucket.
- Proof upload blocks empty proof records.
- Automation drafts can be copied as local text.
- Message drafts can choose a local draft intent and show note readiness before generating work-order, vendor, client or content text.
- Message draft copy shows a manual textarea fallback when clipboard access is blocked.
- The app can copy a local workspace JSON snapshot for manual backup or team handoff.
- The app can preview and restore a local workspace snapshot JSON without claiming cloud sync.

## Backend Foundation

The first backend layer now uses one central SQLite database for local testing.

- Schema: `server/db/schema.sql`
- DB access: `server/centralDb.mjs`
- API server: `server/centralDbServer.mjs`
- Runbook: `docs/contractor-desk-central-db.md`
- Admin desk route: `/contractor-admin`

Current backend user logic:

- each backend user has a user ID and login ID;
- admin can create partner users and temporary passwords;
- admin can copy a plain login handoff with user ID, login ID, app URL and backend URL;
- admin can reset a selected user's password and old sessions are cleared;
- admin can pause, activate or disable users;
- admin can add starter project data for guided onboarding;
- admin can add support notes for each user;
- partner login can load that user's backend workspace in Contractor Desk.
- repeated project syncs from the same user update the existing request instead of failing as a duplicate.

Commands:

```powershell
npm.cmd run backend:init
npm.cmd run backend:check
npm.cmd run backend:server
```

This is a local central DB foundation, not a hosted production backend yet.

## Rebuild Command

```powershell
npm.cmd run contractor-desk:apk
```

This runs the Vite build, removes any previous APK files from `build/downloads`, syncs Capacitor, assembles the Android debug APK, then copies it to:

- `public/downloads/contractor-desk-debug.apk`
- `build/downloads/contractor-desk-debug.apk`
- `android/app/build/outputs/apk/debug/app-debug.apk`

## Verification

Use these checks after rebuild:

```powershell
npm.cmd run build
npm.cmd run contractor-desk:apk
Get-ChildItem -Path android/app/src/main/assets/public -Recurse -Filter *.apk
```

The app ID is `in.altercraft.contractordesk`, and native launch redirects to `/contractor-desk`.
