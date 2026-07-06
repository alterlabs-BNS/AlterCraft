import { rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
process.env.ALTERCRAFT_DB_PATH = process.env.ALTERCRAFT_DB_PATH || join(__dirname, 'data', 'altercraft-central-check.sqlite');
rmSync(process.env.ALTERCRAFT_DB_PATH, { force: true });

const {
  addMessageDraft,
  addMoneyEntry,
  addSiteProof,
  centralDbStatus,
  createProjectRequest,
  createStarterDataForUser,
  createUserAccount,
  ensureCentralDb,
  getUserWorkspace,
  listProjectRequests,
  loginUser,
  openCentralDb,
  setupAdminAccount,
} = await import('./centralDb.mjs');

const db = ensureCentralDb(openCentralDb());

const adminSession = setupAdminAccount(db, {
  loginId: 'altercraft-admin',
  password: 'Admin#2026',
  displayName: 'AlterCraft Admin',
  phone: '8817503658',
  company: 'AlterCraft',
});

const partnerUser = createUserAccount(db, {
  loginId: 'smoke-studio',
  password: 'Partner#2026',
  displayName: 'Smoke Test Partner',
  phone: '9999999999',
  company: 'Smoke Test Studio',
  city: 'Ghaziabad',
  partnerRole: 'Interior Designer',
  helpLevel: 'guided',
}, adminSession.user.id);

const partnerSession = loginUser(db, {
  loginId: 'smoke-studio',
  password: 'Partner#2026',
});

const project = createProjectRequest(db, {
  userId: partnerUser.id,
  role: 'Interior Designer',
  name: 'Smoke Test Partner',
  phone: '9999999999',
  company: 'Smoke Test Studio',
  city: 'Ghaziabad',
  service: 'interior-fitout',
  execution: 'white_label',
  area: 900,
  propertyType: 'Apartment',
  startWindow: 'Within 15 days',
  materialGrade: 'Designer BOQ',
  notes: 'Smoke test project to confirm the central DB can save a user-owned Contractor Desk request.',
  attachments: ['BOQ available', 'Site photos available'],
  valueLow: 220000,
  valueHigh: 260000,
  token: 18000,
});

const resyncedProject = createProjectRequest(db, {
  id: project.id,
  userId: partnerUser.id,
  role: 'Interior Designer',
  name: 'Smoke Test Partner',
  phone: '9999999999',
  company: 'Smoke Test Studio',
  city: 'Ghaziabad',
  service: 'interior-fitout',
  execution: 'white_label',
  area: 920,
  propertyType: 'Apartment',
  startWindow: 'Within 15 days',
  materialGrade: 'Designer BOQ',
  notes: 'Smoke test project updated by a repeated sync from the same partner account.',
  attachments: ['BOQ available'],
  valueLow: 230000,
  valueHigh: 270000,
  token: 18000,
});

addSiteProof(db, project.id, {
  type: 'Before photo',
  actor: 'Site supervisor',
  note: 'Smoke test proof record.',
  files: ['before-photo.jpg'],
});

addMoneyEntry(db, project.id, {
  direction: 'received',
  bucket: 'advance',
  amount: 18000,
  note: 'Smoke test token entry.',
});

addMessageDraft(db, project.id, {
  kind: 'client',
  title: 'Smoke test update',
  body: 'Project request saved in the central database.',
});

const seededWorkspace = createStarterDataForUser(db, partnerUser.id, {
  label: 'Admin starter scope',
  service: 'modular',
  execution: 'white_label',
  area: 700,
}, adminSession.user.id);

console.log(JSON.stringify({
  ok: true,
  adminUserId: adminSession.user.id,
  partnerUserId: partnerUser.id,
  partnerLoginId: partnerSession.user.loginId,
  savedProjectId: project.id,
  resyncedProjectId: resyncedProject.id,
  resyncedProjectArea: resyncedProject.area,
  status: centralDbStatus(db),
  latestProjectCount: listProjectRequests(db, { limit: 5 }).length,
  partnerProjectCount: getUserWorkspace(db, partnerUser.id).projects.length,
  seededProjectCount: seededWorkspace.projects.length,
}, null, 2));
