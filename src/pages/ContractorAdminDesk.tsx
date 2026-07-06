import { useEffect, useMemo, useState } from 'react';
import {
  ClipboardList,
  Database,
  KeyRound,
  LifeBuoy,
  LockKeyhole,
  LogOut,
  Plus,
  RefreshCw,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';
import '../styles/contractor-admin-desk.css';

type AdminUser = {
  id: string;
  loginId: string;
  accountType: string;
  status: string;
  displayName: string;
  phone: string;
  email: string;
  company: string;
  city: string;
  partnerRole: string;
  helpLevel: string;
  onboardingStage: string;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
};

type AdminNote = {
  id: string;
  noteType: string;
  note: string;
  followUpAt?: string;
  createdAt: string;
};

type AdminProject = {
  id: string;
  title: string;
  service: string;
  execution: string;
  area: number;
  valueLow: number;
  valueHigh: number;
  token: number;
  stage: string;
  paymentGate: string;
  createdAt: string;
};

type Dashboard = {
  status: Record<string, number | string>;
  users: AdminUser[];
  totals: {
    users: number;
    activeUsers: number;
    guidedUsers: number;
    starterData: number;
    adminNotes: number;
  };
};

type Workspace = {
  user: AdminUser;
  projects: AdminProject[];
  notes: AdminNote[];
  starterData: Array<{ id: string; label: string; createdAt: string }>;
};

const TOKEN_KEY = 'altercraft-contractor-admin-token';
const API_BASE_KEY = 'altercraft-contractor-admin-api-base';
const defaultApiBase = 'http://127.0.0.1:8788';

const partnerRoles = ['Interior Designer', 'Architect', 'Builder', 'Developer', 'Contractor', 'Realtor'];
const accountTypes = [
  { value: 'partner_admin', label: 'Partner admin' },
  { value: 'partner_member', label: 'Partner staff' },
  { value: 'altercraft_admin', label: 'AlterCraft admin' },
];
const helpLevels = [
  { value: 'guided', label: 'Guided' },
  { value: 'admin_filled', label: 'Admin filled' },
  { value: 'self_serve', label: 'Self serve' },
];
const statuses = ['active', 'paused', 'disabled'];

const blankUser = {
  displayName: '',
  phone: '',
  company: '',
  city: 'Ghaziabad / Delhi NCR',
  partnerRole: 'Interior Designer',
  accountType: 'partner_admin',
  loginId: '',
  password: 'ChangeMe#2026',
  helpLevel: 'guided',
};

const starterDefaults = {
  label: 'First guided project',
  service: 'interior-fitout',
  execution: 'labour_material',
  area: 900,
};

function readStored(key: string, fallback: string) {
  if (typeof window === 'undefined') return fallback;
  return window.localStorage.getItem(key) || fallback;
}

function formatMoney(value: number) {
  return `INR ${Math.round(value || 0).toLocaleString('en-IN')}`;
}

async function copyText(value: string) {
  if (!value.trim()) return false;
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);
    return copied;
  }
}

export default function ContractorAdminDesk() {
  const [apiBase, setApiBase] = useState(() => readStored(API_BASE_KEY, defaultApiBase));
  const [token, setToken] = useState(() => readStored(TOKEN_KEY, ''));
  const [loginId, setLoginId] = useState('altercraft-admin');
  const [password, setPassword] = useState('Admin#2026');
  const [setupForm, setSetupForm] = useState({ loginId: 'altercraft-admin', password: 'Admin#2026', displayName: 'AlterCraft Admin', phone: '' });
  const [newUser, setNewUser] = useState(blankUser);
  const [starterForm, setStarterForm] = useState(starterDefaults);
  const [noteText, setNoteText] = useState('');
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [status, setStatus] = useState('Start the local backend, then log in.');
  const [busy, setBusy] = useState(false);
  const [resetPassword, setResetPassword] = useState('ChangeMe#2026');
  const [lastPasswordHandoff, setLastPasswordHandoff] = useState<{ userId: string; password: string } | null>(null);
  const [handoffCopied, setHandoffCopied] = useState(false);

  const selectedUser = useMemo(
    () => dashboard?.users.find((user) => user.id === selectedUserId) || workspace?.user || null,
    [dashboard?.users, selectedUserId, workspace?.user],
  );
  const contractorDeskUrl = typeof window === 'undefined' ? '/contractor-desk' : `${window.location.origin}/contractor-desk`;
  const selectedUserPassword =
    selectedUser && lastPasswordHandoff?.userId === selectedUser.id ? lastPasswordHandoff.password : 'Reset password in admin before sharing';
  const selectedUserHandoff = selectedUser
    ? [
        'AlterCraft Contractor Desk login',
        `Name: ${selectedUser.displayName}`,
        `User ID: ${selectedUser.id}`,
        `Login ID: ${selectedUser.loginId}`,
        `Password: ${selectedUserPassword}`,
        `App: ${contractorDeskUrl}`,
        `Backend: ${apiBase}`,
        'Use this after AlterCraft admin has confirmed the password reset.',
      ].join('\n')
    : '';

  const authHeaders = token ? { authorization: `Bearer ${token}` } : {};

  async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${apiBase.replace(/\/$/, '')}${path}`, {
      ...options,
      headers: {
        'content-type': 'application/json',
        ...authHeaders,
        ...(options.headers || {}),
      },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || 'Request failed.');
    return payload;
  }

  async function loadDashboard(nextSelectedId = selectedUserId) {
    if (!token) return;
    setBusy(true);
    try {
      const data = await api<Dashboard>('/api/admin/dashboard');
      setDashboard(data);
      const nextUserId = nextSelectedId || data.users.find((user) => user.accountType !== 'altercraft_admin')?.id || data.users[0]?.id || '';
      setSelectedUserId(nextUserId);
      if (nextUserId) await loadWorkspace(nextUserId);
      setStatus(`Loaded ${data.users.length} user account(s).`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not load admin desk.');
    } finally {
      setBusy(false);
    }
  }

  async function loadWorkspace(userId: string) {
    if (!userId) return;
    const data = await api<Workspace>(`/api/admin/users/${encodeURIComponent(userId)}`);
    setWorkspace(data);
    setSelectedUserId(userId);
  }

  async function submitLogin(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      window.localStorage.setItem(API_BASE_KEY, apiBase);
      const session = await api<{ token: string; user: AdminUser }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ loginId, password }),
      });
      window.localStorage.setItem(TOKEN_KEY, session.token);
      setToken(session.token);
      setStatus(`Logged in as ${session.user.loginId}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Login failed.');
    } finally {
      setBusy(false);
    }
  }

  async function submitSetup(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      window.localStorage.setItem(API_BASE_KEY, apiBase);
      const session = await api<{ token: string; user: AdminUser }>('/api/admin/setup', {
        method: 'POST',
        body: JSON.stringify(setupForm),
      });
      window.localStorage.setItem(TOKEN_KEY, session.token);
      setToken(session.token);
      setStatus(`Admin ready: ${session.user.loginId}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Setup failed.');
    } finally {
      setBusy(false);
    }
  }

  async function createUser(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const temporaryPassword = newUser.password;
      const response = await api<{ user: AdminUser }>('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(newUser),
      });
      setNewUser(blankUser);
      setResetPassword(temporaryPassword || 'ChangeMe#2026');
      setLastPasswordHandoff(temporaryPassword ? { userId: response.user.id, password: temporaryPassword } : null);
      setHandoffCopied(false);
      await loadDashboard(response.user.id);
      setStatus(`Created login ${response.user.loginId}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not create user.');
    } finally {
      setBusy(false);
    }
  }

  async function updateSelectedUser(patch: Partial<AdminUser> & { password?: string }) {
    if (!selectedUserId) return null;
    setBusy(true);
    try {
      const response = await api<{ user: AdminUser }>(`/api/admin/users/${encodeURIComponent(selectedUserId)}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      });
      await loadDashboard(response.user.id);
      setStatus(`Updated ${response.user.loginId}.`);
      return response.user;
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not update user.');
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function resetSelectedUserPassword(event: React.FormEvent) {
    event.preventDefault();
    const nextPassword = resetPassword.trim();
    if (!selectedUserId || nextPassword.length < 8) {
      setStatus('Use a password with at least 8 characters.');
      return;
    }

    const updatedUser = await updateSelectedUser({ password: nextPassword });
    if (updatedUser) {
      setLastPasswordHandoff({ userId: updatedUser.id, password: nextPassword });
      setHandoffCopied(false);
      setStatus(`Password reset for ${updatedUser.loginId}.`);
    }
  }

  async function copySelectedUserHandoff() {
    const copied = await copyText(selectedUserHandoff);
    setHandoffCopied(copied);
    setStatus(copied ? 'Login handoff copied.' : 'Copy blocked. Select the handoff text and copy it manually.');
  }

  async function seedStarterData(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedUserId) return;
    setBusy(true);
    try {
      const data = await api<Workspace>(`/api/admin/users/${encodeURIComponent(selectedUserId)}/starter-data`, {
        method: 'POST',
        body: JSON.stringify(starterForm),
      });
      setWorkspace(data);
      await loadDashboard(selectedUserId);
      setStatus(`Starter data added for ${data.user.loginId}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not add starter data.');
    } finally {
      setBusy(false);
    }
  }

  async function addNote(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedUserId || !noteText.trim()) return;
    setBusy(true);
    try {
      await api(`/api/admin/users/${encodeURIComponent(selectedUserId)}/notes`, {
        method: 'POST',
        body: JSON.stringify({ noteType: 'support', note: noteText }),
      });
      setNoteText('');
      await loadWorkspace(selectedUserId);
      setStatus('Support note saved.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not save note.');
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    window.localStorage.removeItem(TOKEN_KEY);
    setToken('');
    setDashboard(null);
    setWorkspace(null);
    setSelectedUserId('');
    setStatus('Logged out.');
  }

  useEffect(() => {
    if (token) loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    setHandoffCopied(false);
  }, [selectedUserId]);

  return (
    <main className="contractor-admin-shell">
      <SEOHead title="Contractor Admin Desk | AlterCraft" description="Private local admin desk for Contractor Desk user setup and support." noIndex />
      <section className="contractor-admin-frame">
        <header className="contractor-admin-topbar">
          <div>
            <span><ShieldCheck size={18} /> Local backend</span>
            <h1>Contractor Admin Desk</h1>
          </div>
          {token ? (
            <button type="button" onClick={logout}>
              <LogOut size={16} /> Logout
            </button>
          ) : null}
        </header>

        <div className="contractor-admin-status" role="status">
          <Database size={16} />
          <span>{status}</span>
          {busy ? <RefreshCw size={16} className="is-spinning" /> : null}
        </div>

        {!token ? (
          <section className="contractor-admin-auth">
            <label>
              <span>Backend URL</span>
              <input value={apiBase} onChange={(event) => setApiBase(event.target.value)} />
            </label>

            <form onSubmit={submitLogin} className="contractor-admin-panel">
              <div className="contractor-admin-panel-head">
                <LockKeyhole size={18} />
                <h2>Admin login</h2>
              </div>
              <label>
                <span>Login ID</span>
                <input value={loginId} onChange={(event) => setLoginId(event.target.value)} />
              </label>
              <label>
                <span>Password</span>
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
              </label>
              <button type="submit" disabled={busy}>Login</button>
            </form>

            <form onSubmit={submitSetup} className="contractor-admin-panel">
              <div className="contractor-admin-panel-head">
                <KeyRound size={18} />
                <h2>First admin setup</h2>
              </div>
              <label>
                <span>Login ID</span>
                <input value={setupForm.loginId} onChange={(event) => setSetupForm({ ...setupForm, loginId: event.target.value })} />
              </label>
              <label>
                <span>Password</span>
                <input value={setupForm.password} onChange={(event) => setSetupForm({ ...setupForm, password: event.target.value })} />
              </label>
              <label>
                <span>Name</span>
                <input value={setupForm.displayName} onChange={(event) => setSetupForm({ ...setupForm, displayName: event.target.value })} />
              </label>
              <button type="submit" disabled={busy}>Create first admin</button>
            </form>
          </section>
        ) : (
          <section className="contractor-admin-workspace">
            <aside className="contractor-admin-sidebar">
              <div className="contractor-admin-metrics">
                <article><Users size={17} /><span>Users</span><strong>{dashboard?.totals.users ?? 0}</strong></article>
                <article><LifeBuoy size={17} /><span>Guided</span><strong>{dashboard?.totals.guidedUsers ?? 0}</strong></article>
                <article><ClipboardList size={17} /><span>Starter</span><strong>{dashboard?.totals.starterData ?? 0}</strong></article>
              </div>

              <form onSubmit={createUser} className="contractor-admin-create">
                <div className="contractor-admin-panel-head">
                  <Plus size={18} />
                  <h2>Create user</h2>
                </div>
                <input placeholder="Partner name" value={newUser.displayName} onChange={(event) => setNewUser({ ...newUser, displayName: event.target.value })} />
                <input placeholder="Phone" value={newUser.phone} onChange={(event) => setNewUser({ ...newUser, phone: event.target.value })} />
                <input placeholder="Company" value={newUser.company} onChange={(event) => setNewUser({ ...newUser, company: event.target.value })} />
                <select value={newUser.partnerRole} onChange={(event) => setNewUser({ ...newUser, partnerRole: event.target.value })}>
                  {partnerRoles.map((role) => <option key={role}>{role}</option>)}
                </select>
                <input placeholder="Login ID optional" value={newUser.loginId} onChange={(event) => setNewUser({ ...newUser, loginId: event.target.value })} />
                <input placeholder="Temporary password" value={newUser.password} onChange={(event) => setNewUser({ ...newUser, password: event.target.value })} />
                <button type="submit" disabled={busy}>Create account</button>
              </form>

              <div className="contractor-admin-users">
                {(dashboard?.users || []).map((user) => (
                  <button
                    type="button"
                    key={user.id}
                    className={user.id === selectedUserId ? 'is-active' : ''}
                    onClick={() => loadWorkspace(user.id)}
                  >
                    <UserRound size={16} />
                    <span>
                      <strong>{user.displayName}</strong>
                      <small>{user.loginId} / {user.status}</small>
                    </span>
                  </button>
                ))}
              </div>
            </aside>

            <section className="contractor-admin-detail">
              {selectedUser ? (
                <>
                  <div className="contractor-admin-user-head">
                    <div>
                      <span>{selectedUser.loginId}</span>
                      <h2>{selectedUser.displayName}</h2>
                      <p>{selectedUser.company || 'No company'} / {selectedUser.partnerRole} / User ID {selectedUser.id}</p>
                    </div>
                    <button type="button" onClick={() => loadDashboard(selectedUser.id)} disabled={busy}>
                      <RefreshCw size={16} /> Refresh
                    </button>
                  </div>

                  <div className="contractor-admin-control-row">
                    <label>
                      <span>Status</span>
                      <select value={selectedUser.status} onChange={(event) => updateSelectedUser({ status: event.target.value })}>
                        {statuses.map((item) => <option key={item}>{item}</option>)}
                      </select>
                    </label>
                    <label>
                      <span>Help level</span>
                      <select value={selectedUser.helpLevel} onChange={(event) => updateSelectedUser({ helpLevel: event.target.value })}>
                        {helpLevels.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                      </select>
                    </label>
                    <label>
                      <span>Account type</span>
                      <select value={selectedUser.accountType} onChange={(event) => updateSelectedUser({ accountType: event.target.value })}>
                        {accountTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                      </select>
                    </label>
                  </div>

                  <section className="contractor-admin-handoff">
                    <div className="contractor-admin-panel-head">
                      <KeyRound size={18} />
                      <h2>Login handoff</h2>
                    </div>
                    <div className="contractor-admin-handoff-grid">
                      <span><strong>User ID</strong>{selectedUser.id}</span>
                      <span><strong>Login ID</strong>{selectedUser.loginId}</span>
                      <span><strong>Status</strong>{selectedUser.status}</span>
                    </div>
                    <form className="contractor-admin-reset-row" onSubmit={resetSelectedUserPassword}>
                      <label>
                        <span>New temporary password</span>
                        <input value={resetPassword} onChange={(event) => setResetPassword(event.target.value)} />
                      </label>
                      <button type="submit" disabled={busy || resetPassword.trim().length < 8}>Reset password</button>
                      <button type="button" onClick={copySelectedUserHandoff} disabled={!selectedUserHandoff}>Copy handoff</button>
                    </form>
                    <textarea readOnly value={selectedUserHandoff} aria-label="Login handoff text" />
                    <small>
                      {handoffCopied
                        ? 'Copied. Share only through a trusted channel.'
                        : 'Password is shown in this handoff only after this admin screen creates or resets it.'}
                    </small>
                  </section>

                  <form className="contractor-admin-seed" onSubmit={seedStarterData}>
                    <div className="contractor-admin-panel-head">
                      <ClipboardList size={18} />
                      <h2>Starter data</h2>
                    </div>
                    <input value={starterForm.label} onChange={(event) => setStarterForm({ ...starterForm, label: event.target.value })} />
                    <select value={starterForm.service} onChange={(event) => setStarterForm({ ...starterForm, service: event.target.value })}>
                      <option value="interior-fitout">Interior fitout</option>
                      <option value="modular">Modular manufacturing</option>
                      <option value="civil-block">Civil and block work</option>
                      <option value="concrete">Concrete and base work</option>
                      <option value="exterior">Exterior execution</option>
                      <option value="finishing">Finishing package</option>
                    </select>
                    <input type="number" min={50} value={starterForm.area} onChange={(event) => setStarterForm({ ...starterForm, area: Number(event.target.value) })} />
                    <button type="submit" disabled={busy}>Add starter data</button>
                  </form>

                  <form className="contractor-admin-note-form" onSubmit={addNote}>
                    <textarea value={noteText} onChange={(event) => setNoteText(event.target.value)} placeholder="Support note for this user..." />
                    <button type="submit" disabled={busy || !noteText.trim()}>Save note</button>
                  </form>

                  <div className="contractor-admin-lists">
                    <section>
                      <h3>Projects</h3>
                      {(workspace?.projects || []).map((project) => (
                        <article key={project.id}>
                          <strong>{project.title}</strong>
                          <span>{project.service} / {project.execution} / {project.area} sq ft</span>
                          <small>{formatMoney(project.valueLow)} - {formatMoney(project.valueHigh)} / Token {formatMoney(project.token)}</small>
                        </article>
                      ))}
                      {!workspace?.projects.length ? <p>No projects saved for this user.</p> : null}
                    </section>
                    <section>
                      <h3>Admin notes</h3>
                      {(workspace?.notes || []).map((note) => (
                        <article key={note.id}>
                          <strong>{note.noteType}</strong>
                          <span>{note.note}</span>
                          <small>{new Date(note.createdAt).toLocaleString('en-IN')}</small>
                        </article>
                      ))}
                      {!workspace?.notes.length ? <p>No admin notes yet.</p> : null}
                    </section>
                  </div>
                </>
              ) : (
                <div className="contractor-admin-empty">
                  <Users size={34} />
                  <h2>No user selected</h2>
                </div>
              )}
            </section>
          </section>
        )}
      </section>
    </main>
  );
}
