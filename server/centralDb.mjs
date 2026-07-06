import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultDbPath = join(__dirname, 'data', 'altercraft-central.sqlite');
const schemaPath = join(__dirname, 'db', 'schema.sql');

const roles = new Set(['Interior Designer', 'Architect', 'Builder', 'Developer', 'Contractor', 'Realtor']);
const accountTypes = new Set(['altercraft_admin', 'partner_admin', 'partner_member']);
const accountStatuses = new Set(['active', 'paused', 'disabled']);
const helpLevels = new Set(['self_serve', 'guided', 'admin_filled']);
const services = new Set(['civil-block', 'concrete', 'exterior', 'interior-fitout', 'modular', 'finishing']);
const executions = new Set(['labour_only', 'material_only', 'labour_material', 'turnkey', 'white_label']);
const stages = new Set([
  'Lead',
  'Scope',
  'BOQ',
  'Quote',
  'Advance',
  'Work Order',
  'Material',
  'Labour',
  'Production',
  'Site',
  'QC',
  'Handover',
  'Closed',
]);
const paymentGates = new Set(['Pending', 'Cleared', 'Blocked']);

export function getCentralDbPath() {
  return process.env.ALTERCRAFT_DB_PATH || process.env.DATABASE_PATH || defaultDbPath;
}

export function openCentralDb() {
  const dbPath = getCentralDbPath();
  mkdirSync(dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON;');
  return db;
}

export function ensureCentralDb(db = openCentralDb()) {
  if (!existsSync(schemaPath)) {
    throw new Error(`Central DB schema is missing at ${schemaPath}`);
  }

  db.exec(readFileSync(schemaPath, 'utf8'));
  runCentralMigrations(db);
  return db;
}

function tableColumns(db, tableName) {
  return new Set(db.prepare(`PRAGMA table_info(${tableName})`).all().map((column) => column.name));
}

function addColumnIfMissing(db, tableName, columnName, definition) {
  const columns = tableColumns(db, tableName);
  if (!columns.has(columnName)) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

function runCentralMigrations(db) {
  addColumnIfMissing(db, 'project_requests', 'user_id', 'TEXT REFERENCES user_accounts(id) ON DELETE SET NULL');
  addColumnIfMissing(db, 'message_drafts', 'user_id', 'TEXT REFERENCES user_accounts(id) ON DELETE SET NULL');
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_project_requests_user ON project_requests(user_id);
    CREATE INDEX IF NOT EXISTS idx_message_drafts_user ON message_drafts(user_id);
  `);
}

export function makeCentralId(prefix) {
  return `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 18)}`;
}

export function nowIso() {
  return new Date().toISOString();
}

function asText(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text || fallback;
}

function asInteger(value, fallback = 0) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(0, Math.round(number));
}

function oneOf(value, allowed, fallback) {
  const text = asText(value, fallback);
  return allowed.has(text) ? text : fallback;
}

function normalizePhone(phone) {
  return asText(phone).replace(/\D/g, '').slice(-12);
}

function normalizeLoginId(value) {
  return asText(value).toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48);
}

function slugPart(value, fallback = 'partner') {
  const slug = asText(value, fallback)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 18);
  return slug || fallback;
}

function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  const hash = scryptSync(String(password), salt, 64).toString('hex');
  return { salt, hash };
}

function verifyPassword(password, user) {
  if (!user?.password_salt || !user?.password_hash) return false;
  const next = hashPassword(password, user.password_salt).hash;
  return timingSafeEqual(Buffer.from(next, 'hex'), Buffer.from(user.password_hash, 'hex'));
}

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

function cleanList(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => asText(item))
    .filter(Boolean)
    .slice(0, 20);
}

function readPartner(row) {
  if (!row) return null;
  return {
    id: row.id,
    role: row.role,
    name: row.name,
    phone: row.phone,
    company: row.company,
    city: row.city,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function readUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    loginId: row.login_id,
    accountType: row.account_type,
    status: row.status,
    displayName: row.display_name,
    phone: row.phone,
    email: row.email,
    company: row.company,
    city: row.city,
    partnerRole: row.partner_role,
    partnerId: row.partner_id,
    helpLevel: row.help_level,
    onboardingStage: row.onboarding_stage,
    adminNotes: row.admin_notes,
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function readAdminNote(row) {
  return {
    id: row.id,
    userId: row.user_id,
    adminUserId: row.admin_user_id,
    noteType: row.note_type,
    note: row.note,
    followUpAt: row.follow_up_at,
    createdAt: row.created_at,
  };
}

function readProject(row, attachments = []) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    partnerId: row.partner_id,
    userId: row.user_id,
    partner: readPartner({
      id: row.partner_id,
      role: row.partner_role,
      name: row.partner_name,
      phone: row.partner_phone,
      company: row.partner_company,
      city: row.partner_city,
      created_at: row.partner_created_at,
      updated_at: row.partner_updated_at,
    }),
    user: row.user_id
      ? readUser({
          id: row.user_id,
          login_id: row.user_login_id,
          account_type: row.user_account_type,
          status: row.user_status,
          display_name: row.user_display_name,
          phone: row.user_phone,
          email: row.user_email,
          company: row.user_company,
          city: row.user_city,
          partner_role: row.user_partner_role,
          partner_id: row.user_partner_id,
          help_level: row.user_help_level,
          onboarding_stage: row.user_onboarding_stage,
          admin_notes: row.user_admin_notes,
          last_login_at: row.user_last_login_at,
          created_at: row.user_created_at,
          updated_at: row.user_updated_at,
        })
      : null,
    service: row.service,
    execution: row.execution_type,
    area: row.area_sq_ft,
    propertyType: row.property_type,
    startWindow: row.start_window,
    materialGrade: row.material_grade,
    notes: row.notes,
    valueLow: row.value_low,
    valueHigh: row.value_high,
    token: row.token_amount,
    stage: row.stage,
    owner: row.owner,
    paymentGate: row.payment_gate,
    proofMissing: row.proof_missing,
    status: row.status,
    attachments,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function projectSelectSql(whereClause = '') {
  return `
    SELECT
      pr.*,
      p.role AS partner_role,
      p.name AS partner_name,
      p.phone AS partner_phone,
      p.company AS partner_company,
      p.city AS partner_city,
      p.created_at AS partner_created_at,
      p.updated_at AS partner_updated_at,
      u.login_id AS user_login_id,
      u.account_type AS user_account_type,
      u.status AS user_status,
      u.display_name AS user_display_name,
      u.phone AS user_phone,
      u.email AS user_email,
      u.company AS user_company,
      u.city AS user_city,
      u.partner_role AS user_partner_role,
      u.partner_id AS user_partner_id,
      u.help_level AS user_help_level,
      u.onboarding_stage AS user_onboarding_stage,
      u.admin_notes AS user_admin_notes,
      u.last_login_at AS user_last_login_at,
      u.created_at AS user_created_at,
      u.updated_at AS user_updated_at
    FROM project_requests pr
    JOIN partners p ON p.id = pr.partner_id
    LEFT JOIN user_accounts u ON u.id = pr.user_id
    ${whereClause}
  `;
}

function getAttachments(db, projectId) {
  return db
    .prepare('SELECT label FROM project_attachments WHERE project_id = ? ORDER BY created_at ASC')
    .all(projectId)
    .map((row) => row.label);
}

function audit(db, action, targetTable, targetId, details = {}, actor = 'system') {
  db.prepare(`
    INSERT INTO audit_events (id, actor, action, target_table, target_id, details_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(makeCentralId('audit'), actor, action, targetTable, targetId, JSON.stringify(details), nowIso());
}

function upsertPartner(db, payload, timestamp) {
  const phone = asText(payload.phone);
  const normalizedPhone = normalizePhone(phone);
  const existing = normalizedPhone
    ? db.prepare('SELECT * FROM partners WHERE normalized_phone = ? ORDER BY updated_at DESC LIMIT 1').get(normalizedPhone)
    : null;

  const partner = {
    role: oneOf(payload.role, roles, 'Contractor'),
    name: asText(payload.name, 'Unnamed partner'),
    phone,
    normalizedPhone,
    company: asText(payload.company),
    city: asText(payload.city, 'Ghaziabad / Delhi NCR'),
  };

  if (existing) {
    db.prepare(`
      UPDATE partners
      SET role = ?, name = ?, phone = ?, company = ?, city = ?, updated_at = ?
      WHERE id = ?
    `).run(partner.role, partner.name, partner.phone, partner.company, partner.city, timestamp, existing.id);
    return existing.id;
  }

  const id = makeCentralId('partner');
  db.prepare(`
    INSERT INTO partners (id, role, name, phone, normalized_phone, company, city, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, partner.role, partner.name, partner.phone, partner.normalizedPhone, partner.company, partner.city, timestamp, timestamp);
  return id;
}

function userRowById(db, userId) {
  return db.prepare('SELECT * FROM user_accounts WHERE id = ?').get(userId);
}

function userRowByLoginId(db, loginId) {
  return db.prepare('SELECT * FROM user_accounts WHERE login_id = ?').get(normalizeLoginId(loginId));
}

function adminExists(db) {
  return Boolean(db.prepare("SELECT id FROM user_accounts WHERE account_type = 'altercraft_admin' LIMIT 1").get());
}

function isAdminUser(user) {
  return user?.account_type === 'altercraft_admin' && user?.status === 'active';
}

function makeUniqueLoginId(db, payload) {
  const provided = normalizeLoginId(payload.loginId ?? payload.login_id);
  if (provided && !userRowByLoginId(db, provided)) return provided;

  const phoneTail = normalizePhone(payload.phone).slice(-4);
  const base = normalizeLoginId(`${slugPart(payload.company || payload.name || payload.displayName)}${phoneTail ? `-${phoneTail}` : ''}`) || 'partner';
  let candidate = base;
  let counter = 1;

  while (userRowByLoginId(db, candidate)) {
    counter += 1;
    candidate = `${base}-${counter}`;
  }

  return candidate;
}

function createSession(db, userId) {
  const token = randomBytes(32).toString('hex');
  const timestamp = nowIso();
  db.prepare(`
    INSERT INTO user_sessions (id, user_id, token_hash, created_at, last_seen_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(makeCentralId('session'), userId, hashToken(token), timestamp, timestamp);
  return token;
}

function createUserAccountInternal(db, payload, actor = 'system') {
  const timestamp = nowIso();
  const password = asText(payload.password, 'ChangeMe#2026');
  const passwordRecord = hashPassword(password);
  const partnerId = payload.partnerId || upsertPartner(db, {
    role: payload.partnerRole ?? payload.role,
    name: payload.displayName ?? payload.name,
    phone: payload.phone,
    company: payload.company,
    city: payload.city,
  }, timestamp);
  const loginId = makeUniqueLoginId(db, payload);
  const userId = asText(payload.id) || makeCentralId('user');

  db.prepare(`
    INSERT INTO user_accounts (
      id,
      login_id,
      account_type,
      status,
      display_name,
      phone,
      normalized_phone,
      email,
      company,
      city,
      partner_role,
      partner_id,
      password_salt,
      password_hash,
      help_level,
      onboarding_stage,
      admin_notes,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    userId,
    loginId,
    oneOf(payload.accountType ?? payload.account_type, accountTypes, 'partner_admin'),
    oneOf(payload.status, accountStatuses, 'active'),
    asText(payload.displayName ?? payload.name, 'New partner user'),
    asText(payload.phone),
    normalizePhone(payload.phone),
    asText(payload.email).toLowerCase(),
    asText(payload.company),
    asText(payload.city, 'Ghaziabad / Delhi NCR'),
    oneOf(payload.partnerRole ?? payload.role, roles, 'Contractor'),
    partnerId,
    passwordRecord.salt,
    passwordRecord.hash,
    oneOf(payload.helpLevel, helpLevels, 'guided'),
    asText(payload.onboardingStage, 'New'),
    asText(payload.adminNotes),
    timestamp,
    timestamp,
  );

  audit(db, 'user.create', 'user_accounts', userId, { loginId, accountType: payload.accountType ?? payload.account_type }, actor);
  return readUser(userRowById(db, userId));
}

export function setupAdminAccount(db, payload = {}) {
  ensureCentralDb(db);
  const setupKey = process.env.ALTERCRAFT_ADMIN_SETUP_KEY || '';
  if (setupKey && asText(payload.setupKey) !== setupKey) {
    const error = new Error('Valid setup key is required.');
    error.statusCode = 401;
    throw error;
  }

  if (adminExists(db)) {
    const error = new Error('Admin account already exists.');
    error.statusCode = 409;
    throw error;
  }

  const user = createUserAccountInternal(db, {
    ...payload,
    accountType: 'altercraft_admin',
    displayName: asText(payload.displayName ?? payload.name, 'AlterCraft Admin'),
    company: asText(payload.company, 'AlterCraft'),
    partnerRole: 'Contractor',
    helpLevel: 'admin_filled',
  }, 'setup');
  const token = createSession(db, user.id);
  return { token, user };
}

export function createUserAccount(db, payload, actorUserId = 'system') {
  ensureCentralDb(db);
  return createUserAccountInternal(db, payload, actorUserId);
}

export function loginUser(db, payload) {
  ensureCentralDb(db);
  const loginId = normalizeLoginId(payload.loginId ?? payload.login_id);
  const password = asText(payload.password);
  const user = userRowByLoginId(db, loginId);

  if (!user || !verifyPassword(password, user)) {
    const error = new Error('Invalid login ID or password.');
    error.statusCode = 401;
    throw error;
  }

  if (user.status !== 'active') {
    const error = new Error('This account is not active.');
    error.statusCode = 403;
    throw error;
  }

  const token = createSession(db, user.id);
  const timestamp = nowIso();
  db.prepare('UPDATE user_accounts SET last_login_at = ?, updated_at = ? WHERE id = ?').run(timestamp, timestamp, user.id);
  audit(db, 'auth.login', 'user_accounts', user.id, { loginId }, user.id);
  return { token, user: readUser(userRowById(db, user.id)) };
}

export function getUserByToken(db, token) {
  ensureCentralDb(db);
  const tokenHash = hashToken(asText(token));
  if (!tokenHash) return null;
  const row = db.prepare(`
    SELECT u.*
    FROM user_sessions s
    JOIN user_accounts u ON u.id = s.user_id
    WHERE s.token_hash = ?
    LIMIT 1
  `).get(tokenHash);

  if (!row || row.status !== 'active') return null;
  db.prepare('UPDATE user_sessions SET last_seen_at = ? WHERE token_hash = ?').run(nowIso(), tokenHash);
  return row;
}

export function listUserAccounts(db) {
  ensureCentralDb(db);
  return db
    .prepare('SELECT * FROM user_accounts ORDER BY updated_at DESC, created_at DESC')
    .all()
    .map(readUser);
}

export function updateUserAccount(db, userId, payload, actorUserId = 'system') {
  ensureCentralDb(db);
  const existing = userRowById(db, userId);
  if (!existing) return null;

  const timestamp = nowIso();
  const next = {
    accountType: oneOf(payload.accountType ?? payload.account_type ?? existing.account_type, accountTypes, existing.account_type),
    status: oneOf(payload.status ?? existing.status, accountStatuses, existing.status),
    displayName: asText(payload.displayName ?? payload.name, existing.display_name),
    phone: asText(payload.phone, existing.phone),
    email: asText(payload.email, existing.email).toLowerCase(),
    company: asText(payload.company, existing.company),
    city: asText(payload.city, existing.city),
    partnerRole: oneOf(payload.partnerRole ?? payload.role ?? existing.partner_role, roles, existing.partner_role),
    helpLevel: oneOf(payload.helpLevel ?? existing.help_level, helpLevels, existing.help_level),
    onboardingStage: asText(payload.onboardingStage, existing.onboarding_stage),
    adminNotes: asText(payload.adminNotes, existing.admin_notes),
  };

  db.prepare(`
    UPDATE user_accounts
    SET account_type = ?, status = ?, display_name = ?, phone = ?, normalized_phone = ?, email = ?, company = ?,
        city = ?, partner_role = ?, help_level = ?, onboarding_stage = ?, admin_notes = ?, updated_at = ?
    WHERE id = ?
  `).run(
    next.accountType,
    next.status,
    next.displayName,
    next.phone,
    normalizePhone(next.phone),
    next.email,
    next.company,
    next.city,
    next.partnerRole,
    next.helpLevel,
    next.onboardingStage,
    next.adminNotes,
    timestamp,
    userId,
  );

  if (payload.password) {
    const passwordRecord = hashPassword(payload.password);
    db.prepare('UPDATE user_accounts SET password_salt = ?, password_hash = ?, updated_at = ? WHERE id = ?').run(
      passwordRecord.salt,
      passwordRecord.hash,
      timestamp,
      userId,
    );
    db.prepare('DELETE FROM user_sessions WHERE user_id = ?').run(userId);
  }

  audit(db, 'user.update', 'user_accounts', userId, {
    status: next.status,
    helpLevel: next.helpLevel,
    passwordReset: Boolean(payload.password),
  }, actorUserId);
  return readUser(userRowById(db, userId));
}

export function addAdminUserNote(db, userId, payload, adminUserId = null) {
  ensureCentralDb(db);
  if (!userRowById(db, userId)) return null;

  const note = {
    id: makeCentralId('note'),
    noteType: asText(payload.noteType, 'support'),
    note: asText(payload.note),
    followUpAt: asText(payload.followUpAt),
    createdAt: nowIso(),
  };

  if (!note.note) {
    const error = new Error('Note is required.');
    error.statusCode = 400;
    throw error;
  }

  db.prepare(`
    INSERT INTO admin_user_notes (id, user_id, admin_user_id, note_type, note, follow_up_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(note.id, userId, adminUserId, note.noteType, note.note, note.followUpAt || null, note.createdAt);
  audit(db, 'user.note.create', 'admin_user_notes', note.id, { userId }, adminUserId || 'system');
  return readAdminNote(db.prepare('SELECT * FROM admin_user_notes WHERE id = ?').get(note.id));
}

export function listAdminUserNotes(db, userId) {
  ensureCentralDb(db);
  return db.prepare('SELECT * FROM admin_user_notes WHERE user_id = ? ORDER BY created_at DESC').all(userId).map(readAdminNote);
}

function estimateFromPayload(payload, area) {
  const providedLow = asInteger(payload.valueLow ?? payload.estimate?.valueLow, 0);
  const providedHigh = asInteger(payload.valueHigh ?? payload.estimate?.valueHigh, 0);
  const providedToken = asInteger(payload.token ?? payload.tokenAmount ?? payload.estimate?.token, 0);

  if (providedLow || providedHigh || providedToken) {
    return {
      valueLow: providedLow,
      valueHigh: providedHigh || providedLow,
      token: providedToken,
    };
  }

  const roughRate = 350;
  const low = area * roughRate;
  const high = Math.round(low * 1.18);
  return {
    valueLow: low,
    valueHigh: high,
    token: Math.max(5000, Math.round(low * 0.08)),
  };
}

export function createProjectRequest(db, payload) {
  ensureCentralDb(db);
  const timestamp = nowIso();
  const area = Math.max(50, asInteger(payload.area ?? payload.areaSqFt, 1200));
  const estimate = estimateFromPayload(payload, area);
  const attachments = cleanList(payload.attachments ?? payload.attachmentNames);
  const title = asText(payload.title, `${asText(payload.company || payload.name, 'New')} project request`);
  const projectId = asText(payload.id) || makeCentralId('project');
  const projectUser = payload.userId ? userRowById(db, payload.userId) : payload.loginId ? userRowByLoginId(db, payload.loginId) : null;
  const service = oneOf(payload.service, services, 'interior-fitout');
  const execution = oneOf(payload.execution ?? payload.executionType, executions, 'labour_material');
  const propertyType = asText(payload.propertyType);
  const startWindow = asText(payload.startWindow);
  const materialGrade = asText(payload.materialGrade);
  const notes = asText(payload.notes);
  const stage = oneOf(payload.stage, stages, 'Lead');
  const owner = asText(payload.owner, 'AlterCraft Desk');
  const paymentGate = oneOf(payload.paymentGate, paymentGates, 'Pending');
  const proofMissing = asInteger(payload.proofMissing, attachments.length ? 1 : 2);
  const status = asText(payload.status, 'Draft');

  db.exec('BEGIN IMMEDIATE TRANSACTION;');
  try {
    const partnerId = projectUser?.partner_id || upsertPartner(db, payload, timestamp);
    const existingProject = db.prepare('SELECT id, user_id FROM project_requests WHERE id = ?').get(projectId);
    const existingUserId = asText(existingProject?.user_id);
    const nextUserId = projectUser?.id || existingUserId || null;

    if (existingProject) {
      if (existingUserId && projectUser?.id && existingUserId !== projectUser.id) {
        const error = new Error('Project ID already belongs to another user.');
        error.statusCode = 409;
        throw error;
      }

      db.prepare(`
        UPDATE project_requests
        SET partner_id = ?,
            user_id = ?,
            title = ?,
            service = ?,
            execution_type = ?,
            area_sq_ft = ?,
            property_type = ?,
            start_window = ?,
            material_grade = ?,
            notes = ?,
            value_low = ?,
            value_high = ?,
            token_amount = ?,
            stage = ?,
            owner = ?,
            payment_gate = ?,
            proof_missing = ?,
            status = ?,
            updated_at = ?
        WHERE id = ?
      `).run(
        partnerId,
        nextUserId,
        title,
        service,
        execution,
        area,
        propertyType,
        startWindow,
        materialGrade,
        notes,
        estimate.valueLow,
        estimate.valueHigh,
        estimate.token,
        stage,
        owner,
        paymentGate,
        proofMissing,
        status,
        timestamp,
        projectId,
      );

      db.prepare('DELETE FROM project_attachments WHERE project_id = ?').run(projectId);
    } else {
      db.prepare(`
        INSERT INTO project_requests (
          id,
          partner_id,
          user_id,
          title,
          service,
          execution_type,
          area_sq_ft,
          property_type,
          start_window,
          material_grade,
          notes,
          value_low,
          value_high,
          token_amount,
          stage,
          owner,
          payment_gate,
          proof_missing,
          status,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        projectId,
        partnerId,
        projectUser?.id || null,
        title,
        service,
        execution,
        area,
        propertyType,
        startWindow,
        materialGrade,
        notes,
        estimate.valueLow,
        estimate.valueHigh,
        estimate.token,
        stage,
        owner,
        paymentGate,
        proofMissing,
        status,
        timestamp,
        timestamp,
      );
    }

    const attachmentStmt = db.prepare(`
      INSERT INTO project_attachments (id, project_id, label, source, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    attachments.forEach((label) => attachmentStmt.run(makeCentralId('attach'), projectId, label, 'local_name', timestamp));
    audit(
      db,
      existingProject ? 'project.update' : 'project.create',
      'project_requests',
      projectId,
      { attachmentCount: attachments.length, userId: nextUserId },
      projectUser?.id || 'system',
    );
    db.exec('COMMIT;');
  } catch (error) {
    db.exec('ROLLBACK;');
    throw error;
  }

  return getProjectRequest(db, projectId);
}

export function listProjectRequests(db, options = {}) {
  ensureCentralDb(db);
  const limit = Math.min(Math.max(asInteger(options.limit, 50), 1), 200);
  const userId = asText(options.userId);
  const rows = userId
    ? db.prepare(`${projectSelectSql('WHERE pr.user_id = ?')} ORDER BY pr.created_at DESC LIMIT ?`).all(userId, limit)
    : db.prepare(`${projectSelectSql()} ORDER BY pr.created_at DESC LIMIT ?`).all(limit);
  return rows.map((row) => readProject(row, getAttachments(db, row.id)));
}

export function getProjectRequest(db, id) {
  ensureCentralDb(db);
  const row = db.prepare(`${projectSelectSql('WHERE pr.id = ?')} LIMIT 1`).get(id);
  return row ? readProject(row, getAttachments(db, row.id)) : null;
}

export function isAlterCraftAdmin(user) {
  return isAdminUser(user);
}

export function getUserWorkspace(db, userId) {
  ensureCentralDb(db);
  const user = readUser(userRowById(db, userId));
  if (!user) return null;

  return {
    user,
    projects: listProjectRequests(db, { userId, limit: 100 }),
    notes: listAdminUserNotes(db, userId),
    starterData: db
      .prepare('SELECT * FROM user_starter_data WHERE user_id = ? ORDER BY created_at DESC')
      .all(userId)
      .map((row) => ({
        id: row.id,
        userId: row.user_id,
        createdByUserId: row.created_by_user_id,
        label: row.label,
        data: JSON.parse(row.data_json || '{}'),
        createdAt: row.created_at,
      })),
  };
}

export function getAdminDashboard(db) {
  ensureCentralDb(db);
  const count = (table, where = '') => db.prepare(`SELECT COUNT(*) AS count FROM ${table} ${where}`).get().count;
  return {
    status: centralDbStatus(db),
    users: listUserAccounts(db),
    totals: {
      users: count('user_accounts'),
      activeUsers: count("user_accounts", "WHERE status = 'active'"),
      guidedUsers: count("user_accounts", "WHERE help_level IN ('guided', 'admin_filled')"),
      starterData: count('user_starter_data'),
      adminNotes: count('admin_user_notes'),
    },
  };
}

export function createStarterDataForUser(db, userId, payload = {}, adminUserId = null) {
  ensureCentralDb(db);
  const user = userRowById(db, userId);
  if (!user) return null;

  const timestamp = nowIso();
  const label = asText(payload.label, 'Starter project data');
  const project = createProjectRequest(db, {
    userId,
    role: user.partner_role,
    name: user.display_name,
    phone: user.phone,
    company: user.company,
    city: user.city,
    service: asText(payload.service, 'interior-fitout'),
    execution: asText(payload.execution, 'labour_material'),
    area: asInteger(payload.area, 900),
    propertyType: asText(payload.propertyType, 'Residential / commercial site'),
    startWindow: asText(payload.startWindow, 'Within 15 days'),
    materialGrade: asText(payload.materialGrade, 'To be finalized with BOQ'),
    notes: asText(
      payload.notes,
      'Starter record added by AlterCraft admin so the user can understand project, payment and proof flow.',
    ),
    attachments: cleanList(payload.attachments).length ? cleanList(payload.attachments) : ['Admin filled starter scope', 'Site survey needed'],
    valueLow: asInteger(payload.valueLow, 180000),
    valueHigh: asInteger(payload.valueHigh, 235000),
    token: asInteger(payload.token, 15000),
    status: 'Admin starter',
  });

  const starterRecord = {
    id: makeCentralId('starter'),
    label,
    projectId: project.id,
    assumptions: {
      service: project.service,
      execution: project.execution,
      area: project.area,
      token: project.token,
    },
  };

  db.prepare(`
    INSERT INTO user_starter_data (id, user_id, created_by_user_id, label, data_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(starterRecord.id, userId, adminUserId, label, JSON.stringify(starterRecord), timestamp);

  addAdminUserNote(db, userId, {
    noteType: 'onboarding',
    note: `Starter data added: ${project.title}.`,
  }, adminUserId);

  updateUserAccount(db, userId, {
    helpLevel: 'admin_filled',
    onboardingStage: 'Starter data added',
  }, adminUserId || 'system');

  audit(db, 'user.starter_data.create', 'user_starter_data', starterRecord.id, { userId, projectId: project.id }, adminUserId || 'system');
  return getUserWorkspace(db, userId);
}

export function addSiteProof(db, projectId, payload) {
  ensureCentralDb(db);
  const project = getProjectRequest(db, projectId);
  if (!project) return null;

  const timestamp = nowIso();
  const proofId = asText(payload.id) || makeCentralId('proof');
  const files = cleanList(payload.files);

  db.exec('BEGIN IMMEDIATE TRANSACTION;');
  try {
    db.prepare(`
      INSERT INTO site_proofs (id, project_id, proof_type, actor, note, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      proofId,
      projectId,
      asText(payload.type ?? payload.proofType, 'Site proof'),
      asText(payload.actor, 'AlterCraft team'),
      asText(payload.note),
      asText(payload.status, 'Pending'),
      timestamp,
    );

    const fileStmt = db.prepare(`
      INSERT INTO proof_files (id, proof_id, label, source, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    files.forEach((label) => fileStmt.run(makeCentralId('proof_file'), proofId, label, 'local_name', timestamp));
    audit(db, 'proof.create', 'site_proofs', proofId, { projectId, fileCount: files.length });
    db.exec('COMMIT;');
  } catch (error) {
    db.exec('ROLLBACK;');
    throw error;
  }

  return db.prepare('SELECT * FROM site_proofs WHERE id = ?').get(proofId);
}

export function addMoneyEntry(db, projectId, payload) {
  ensureCentralDb(db);
  if (projectId && !getProjectRequest(db, projectId)) return null;

  const entry = {
    id: asText(payload.id) || makeCentralId('money'),
    direction: asText(payload.direction, 'received'),
    bucket: asText(payload.bucket, 'project'),
    amount: asInteger(payload.amount, 0),
    note: asText(payload.note),
    createdAt: nowIso(),
  };

  if (entry.amount <= 0) {
    const error = new Error('Amount must be greater than zero.');
    error.statusCode = 400;
    throw error;
  }

  db.prepare(`
    INSERT INTO money_entries (id, project_id, direction, bucket, amount, note, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(entry.id, projectId || null, entry.direction, entry.bucket, entry.amount, entry.note, entry.createdAt);
  audit(db, 'money.create', 'money_entries', entry.id, { projectId, amount: entry.amount });
  return { ...entry, projectId: projectId || null };
}

export function addMessageDraft(db, projectId, payload) {
  ensureCentralDb(db);
  const project = projectId ? getProjectRequest(db, projectId) : null;
  if (projectId && !project) return null;

  const draft = {
    id: asText(payload.id) || makeCentralId('draft'),
    kind: asText(payload.kind, 'client'),
    title: asText(payload.title, 'Project message'),
    body: asText(payload.body),
    createdAt: nowIso(),
  };

  if (!draft.body) {
    const error = new Error('Draft body is required.');
    error.statusCode = 400;
    throw error;
  }

  db.prepare(`
    INSERT INTO message_drafts (id, project_id, user_id, kind, title, body, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(draft.id, projectId || null, project?.userId || null, draft.kind, draft.title, draft.body, draft.createdAt);
  audit(db, 'draft.create', 'message_drafts', draft.id, { projectId, kind: draft.kind });
  return { ...draft, projectId: projectId || null, userId: project?.userId || null };
}

export function centralDbStatus(db) {
  ensureCentralDb(db);
  const count = (table) => db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get().count;

  return {
    dbPath: getCentralDbPath(),
    users: count('user_accounts'),
    partners: count('partners'),
    projects: count('project_requests'),
    proofs: count('site_proofs'),
    moneyEntries: count('money_entries'),
    drafts: count('message_drafts'),
    adminNotes: count('admin_user_notes'),
    starterData: count('user_starter_data'),
    auditEvents: count('audit_events'),
  };
}
