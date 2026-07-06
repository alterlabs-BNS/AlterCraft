PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS partners (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  normalized_phone TEXT NOT NULL,
  company TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_partners_phone ON partners(normalized_phone);
CREATE INDEX IF NOT EXISTS idx_partners_company ON partners(company);

CREATE TABLE IF NOT EXISTS user_accounts (
  id TEXT PRIMARY KEY,
  login_id TEXT NOT NULL UNIQUE,
  account_type TEXT NOT NULL DEFAULT 'partner_admin',
  status TEXT NOT NULL DEFAULT 'active',
  display_name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  normalized_phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  company TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  partner_role TEXT NOT NULL DEFAULT 'Contractor',
  partner_id TEXT REFERENCES partners(id) ON DELETE SET NULL,
  password_salt TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  help_level TEXT NOT NULL DEFAULT 'guided',
  onboarding_stage TEXT NOT NULL DEFAULT 'New',
  admin_notes TEXT NOT NULL DEFAULT '',
  last_login_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_accounts_login ON user_accounts(login_id);
CREATE INDEX IF NOT EXISTS idx_user_accounts_phone ON user_accounts(normalized_phone);
CREATE INDEX IF NOT EXISTS idx_user_accounts_status ON user_accounts(status);
CREATE INDEX IF NOT EXISTS idx_user_accounts_partner ON user_accounts(partner_id);

CREATE TABLE IF NOT EXISTS user_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);

CREATE TABLE IF NOT EXISTS project_requests (
  id TEXT PRIMARY KEY,
  partner_id TEXT NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES user_accounts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  service TEXT NOT NULL,
  execution_type TEXT NOT NULL,
  area_sq_ft INTEGER NOT NULL,
  property_type TEXT NOT NULL DEFAULT '',
  start_window TEXT NOT NULL DEFAULT '',
  material_grade TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  value_low INTEGER NOT NULL DEFAULT 0,
  value_high INTEGER NOT NULL DEFAULT 0,
  token_amount INTEGER NOT NULL DEFAULT 0,
  stage TEXT NOT NULL DEFAULT 'Lead',
  owner TEXT NOT NULL DEFAULT 'Unassigned',
  payment_gate TEXT NOT NULL DEFAULT 'Pending',
  proof_missing INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'Draft',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_project_requests_partner ON project_requests(partner_id);
CREATE INDEX IF NOT EXISTS idx_project_requests_created ON project_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_project_requests_stage ON project_requests(stage);
CREATE INDEX IF NOT EXISTS idx_project_requests_payment ON project_requests(payment_gate);

CREATE TABLE IF NOT EXISTS project_attachments (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES project_requests(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'local_name',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_project_attachments_project ON project_attachments(project_id);

CREATE TABLE IF NOT EXISTS site_proofs (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES project_requests(id) ON DELETE CASCADE,
  proof_type TEXT NOT NULL,
  actor TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_site_proofs_project ON site_proofs(project_id);

CREATE TABLE IF NOT EXISTS proof_files (
  id TEXT PRIMARY KEY,
  proof_id TEXT NOT NULL REFERENCES site_proofs(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'local_name',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_proof_files_proof ON proof_files(proof_id);

CREATE TABLE IF NOT EXISTS money_entries (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES project_requests(id) ON DELETE SET NULL,
  direction TEXT NOT NULL,
  bucket TEXT NOT NULL,
  amount INTEGER NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_money_entries_project ON money_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_money_entries_bucket ON money_entries(bucket);

CREATE TABLE IF NOT EXISTS message_drafts (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES project_requests(id) ON DELETE SET NULL,
  user_id TEXT REFERENCES user_accounts(id) ON DELETE SET NULL,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_message_drafts_project ON message_drafts(project_id);

CREATE TABLE IF NOT EXISTS admin_user_notes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
  admin_user_id TEXT REFERENCES user_accounts(id) ON DELETE SET NULL,
  note_type TEXT NOT NULL DEFAULT 'support',
  note TEXT NOT NULL,
  follow_up_at TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_user_notes_user ON admin_user_notes(user_id);

CREATE TABLE IF NOT EXISTS user_starter_data (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
  created_by_user_id TEXT REFERENCES user_accounts(id) ON DELETE SET NULL,
  label TEXT NOT NULL,
  data_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_starter_data_user ON user_starter_data(user_id);

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  actor TEXT NOT NULL DEFAULT 'system',
  action TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_events_target ON audit_events(target_table, target_id);
