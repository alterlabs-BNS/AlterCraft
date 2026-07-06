# Contractor Desk Central DB

This is the first backend layer for AlterCraft Contractor Desk.

It gives the app one central database for users, partner accounts, project requests, proof records, money entries and message drafts. It does not claim cloud hosting yet. The current database runs locally in SQLite so the workflow can be tested before choosing a hosted provider.

## What It Stores

- Partner account details: role, name, phone, company and city.
- User account details: user ID, login ID, account type, status, help level and onboarding stage.
- Login sessions: local backend session tokens are returned to the app and stored as hashes in SQLite.
- Project request: service, execution type, area, notes, estimate, token and stage.
- Scope signals: file names or handoff notes such as BOQ available or site survey needed.
- Site proof: proof type, actor, note, status and file names.
- Money entries: received or spent amount, bucket and note.
- Message drafts: ready text linked to a project.
- Admin notes: support notes, onboarding remarks and follow-up context for each user.
- Starter data: pre-filled sample/project records added by AlterCraft admin for new users.
- Audit events: simple history of backend writes.

## Files

- `server/db/schema.sql`: database tables and indexes.
- `server/centralDb.mjs`: database access layer.
- `server/initCentralDb.mjs`: creates or updates the database.
- `server/centralDbServer.mjs`: local backend API.
- `server/checkCentralDb.mjs`: smoke check that writes one test project.

Local database file:

```text
server/data/altercraft-central.sqlite
```

This file is ignored by Git because it is runtime data.

## Commands

Create the database:

```powershell
npm.cmd run backend:init
```

Run a backend smoke check:

```powershell
npm.cmd run backend:check
```

Start the local backend:

```powershell
npm.cmd run backend:server
```

Open health check:

```text
http://localhost:8788/health
```

## First API Endpoints

```text
GET  /health
POST /api/admin/setup
POST /api/auth/login
GET  /api/auth/me
GET  /api/contractor-desk/bootstrap
GET  /api/contractor-desk/my-workspace
GET  /api/contractor-desk/projects
POST /api/contractor-desk/projects
GET  /api/contractor-desk/projects/:id
POST /api/contractor-desk/projects/:id/proofs
POST /api/contractor-desk/projects/:id/money
POST /api/contractor-desk/projects/:id/drafts
GET  /api/admin/dashboard
GET  /api/admin/users
POST /api/admin/users
GET  /api/admin/users/:id
PATCH /api/admin/users/:id
POST /api/admin/users/:id/notes
POST /api/admin/users/:id/starter-data
```

## Local Admin Desk

Route:

```text
/contractor-admin
```

The local admin desk can:

- create the first AlterCraft admin account,
- log in with admin login ID and password,
- create partner user accounts,
- assign login IDs and temporary passwords,
- show a plain login handoff with user ID, login ID, app URL and backend URL,
- reset a selected user's password and clear old sessions,
- pause, activate or disable users,
- set help level: guided, admin filled or self serve,
- add starter project data for a user,
- add support notes for onboarding.

The user-facing Contractor Desk app can now log in with a partner login ID, load that user's backend workspace and sync new project requests when a backend session exists.
Repeated project syncs with the same project ID and same user update the saved request instead of creating a duplicate or failing on the primary key.

This is still a local backend setup. Do not use it as final production login until the hosted database, deployment, HTTPS, stronger auth rules and backups are in place.

## Optional Local Write Key

For local testing, writes are open by default. To require a simple local key for write requests:

```powershell
$env:ALTERCRAFT_BACKEND_KEY="change-this-local-key"
npm.cmd run backend:server
```

Then send this header on write requests:

```text
x-altercraft-key: change-this-local-key
```

This is not a production login system. Real user login, hosting, file upload and provider-grade security should be added after the central DB flow is approved.
