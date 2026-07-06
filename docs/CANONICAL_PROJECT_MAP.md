# AlterECO Canonical Project Map

Status date: 2026-07-03

## Live Roots

- AlterCraft cash engine: `C:\Users\Altercraft\Desktop\AlterECO\alter craft`
- Git remote: `https://github.com/alterwolfhouse-ai/AlterCraft.git`
- AlterLabs sibling repo: `C:\Users\Altercraft\Desktop\AlterECO\alterlabs`

Do not run Git release work from `C:\Users\Altercraft\Desktop\AlterECO`. That folder is a container, not the AlterCraft repo. Its `.git` folder currently has no `HEAD`, so Git does not recognize it as a valid repository.

## Backup Root

- Safety backups: `C:\Users\Altercraft\Desktop\AlterECO\_safety_backups`
- Current repeatable command: `npm.cmd run repo:backup`
- Required before destructive cleanup: verify `untracked-files.zip`, `backup-summary.txt`, `tracked-working-tree.diff`, and `staged-index.diff`.

## Active Release Wave

These assets belong to the current AlterECO closure wave:

- Public AlterCraft site and SEO/blog/indexing assets.
- Beds storefront, bed images, and starting price ladder.
- Contractor Desk public page and APK handoff files.
- OperatorDesk internal dashboard routes and local server prototype.
- Contractor Desk central DB foundation and backend runbook.
- Ledger schema and cash bucket backend boundary.
- Capital Desk doctrine for self-owned accounting, GST custody, tax reserve and statutory signer boundaries.
- Robotics layer doctrine for assisted manufacturing, site automation, asset tracking and ROI discipline.

## Current Doctrine Source

- `docs/ALTERCRAFT_DOCTRINE.md`: business, product, money, proof, data, revenue, robotics, capital and compliance doctrine.
- `CONTRACTOR_DESK_APK_PIPELINE.md`: Contractor Desk page flow, APK guardrails and local central DB status.
- `docs/contractor-desk-central-db.md`: local DB schema/API runbook.
- `docs/ledger/README.md`: ledger and Capital Desk backend boundary.

Current rule: GitHub stores code and docs, not live customer/project records. Local SQLite is a development central DB. Hosted DB comes after provider selection and deployment. AlterCraft owns the accounting intelligence; outside professionals only validate, sign or file where law requires it.

## Park Or Archive

These should not be mixed into the release commit unless deliberately promoted:

- `Continue Development/` and `Continue Development.zip`
- `Elegant Furniture Business Website/` and matching ZIP
- `Mobile UI Design for Contractor Desk/` and matching ZIP
- `output/chrome-*`, `output/qa/chrome-*`, local browser profiles, screenshots, and temporary QA cache
- `devserver*.log`, `preview*.log`, and `tmp/`

## Build Policy Decision

`build/` is currently gitignored but still has tracked files in history. Until the project makes a clean policy decision, treat `build/` as a generated deployment artifact:

1. Run `npm.cmd run build` before release checks.
2. Commit generated `build/` files only if the release intentionally publishes from tracked build output.
3. Use `ALTERECO_ALLOW_BUILD_COMMIT=1` only for an explicit build-output commit.

## Cleanup Law

No `git clean -f`, `git clean -fd`, `git reset --hard`, or equivalent destructive cleanup should happen until:

1. `npm.cmd run repo:backup` completes with `untracked_files_skipped=0`.
2. The backup ZIP opens and its SHA256 is recorded.
3. The cleanup target list from `git-clean-dry-run.txt` is reviewed.
4. Handoff folders are either archived outside the repo or intentionally promoted into source control.
