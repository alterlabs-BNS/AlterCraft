import { centralDbStatus, ensureCentralDb, openCentralDb } from './centralDb.mjs';

const db = openCentralDb();
ensureCentralDb(db);
const status = centralDbStatus(db);

console.log(JSON.stringify({ ok: true, service: 'altercraft-central-db', ...status }, null, 2));
