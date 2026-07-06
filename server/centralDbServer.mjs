import { createServer } from 'node:http';
import {
  addMessageDraft,
  addMoneyEntry,
  addSiteProof,
  addAdminUserNote,
  centralDbStatus,
  createStarterDataForUser,
  createUserAccount,
  createProjectRequest,
  ensureCentralDb,
  getAdminDashboard,
  getProjectRequest,
  getUserByToken,
  getUserWorkspace,
  isAlterCraftAdmin,
  listProjectRequests,
  loginUser,
  openCentralDb,
  setupAdminAccount,
  updateUserAccount,
} from './centralDb.mjs';

const port = Number(process.env.ALTERCRAFT_BACKEND_PORT || 8788);
const db = ensureCentralDb(openCentralDb());

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,PATCH,OPTIONS',
    'access-control-allow-headers': 'content-type,authorization,x-altercraft-key',
    'content-type': 'application/json; charset=utf-8',
  });
  res.end(JSON.stringify(payload));
}

async function readJson(req) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;
    if (size > 1024 * 1024) {
      const error = new Error('Request body is too large.');
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  if (!chunks.length) return {};

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8').replace(/^\uFEFF/, ''));
  } catch {
    const error = new Error('Invalid JSON body.');
    error.statusCode = 400;
    throw error;
  }
}

function requireWriteAccess(req) {
  const configuredKey = process.env.ALTERCRAFT_BACKEND_KEY || '';
  if (!configuredKey || req.method === 'GET' || req.method === 'OPTIONS') return null;

  const sentKey = req.headers['x-altercraft-key'] || '';
  if (sentKey === configuredKey) return null;

  return { error: 'Backend key is required for this write request.' };
}

function bearerToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : '';
}

function authUser(req) {
  const token = bearerToken(req);
  return token ? getUserByToken(db, token) : null;
}

function requireUser(req) {
  const user = authUser(req);
  if (!user) {
    const error = new Error('Login is required.');
    error.statusCode = 401;
    throw error;
  }
  return user;
}

function requireAdmin(req) {
  const user = requireUser(req);
  if (!isAlterCraftAdmin(user)) {
    const error = new Error('AlterCraft admin access is required.');
    error.statusCode = 403;
    throw error;
  }
  return user;
}

function ensureWriteAllowed(req) {
  const user = authUser(req);
  if (user) return user;
  const writeAccessError = requireWriteAccess(req);
  if (writeAccessError) {
    const error = new Error(writeAccessError.error);
    error.statusCode = 401;
    throw error;
  }
  return null;
}

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 204, {});
  }

  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    if (req.method === 'GET' && url.pathname === '/health') {
      return sendJson(res, 200, { ok: true, service: 'altercraft-central-backend', port, status: centralDbStatus(db) });
    }

    if (req.method === 'POST' && url.pathname === '/api/admin/setup') {
      const body = await readJson(req);
      const session = setupAdminAccount(db, body);
      return sendJson(res, 201, session);
    }

    if (req.method === 'POST' && url.pathname === '/api/auth/login') {
      const body = await readJson(req);
      const session = loginUser(db, body);
      return sendJson(res, 200, session);
    }

    if (req.method === 'GET' && url.pathname === '/api/auth/me') {
      const user = requireUser(req);
      return sendJson(res, 200, { user: getUserWorkspace(db, user.id)?.user });
    }

    if (req.method === 'GET' && url.pathname === '/api/contractor-desk/my-workspace') {
      const user = requireUser(req);
      return sendJson(res, 200, getUserWorkspace(db, user.id));
    }

    if (req.method === 'GET' && url.pathname === '/api/contractor-desk/bootstrap') {
      const user = authUser(req);
      return sendJson(res, 200, {
        status: centralDbStatus(db),
        user: user ? getUserWorkspace(db, user.id)?.user : null,
        projects: user ? listProjectRequests(db, { limit: Number(url.searchParams.get('limit') || 50), userId: user.id }) : [],
      });
    }

    if (req.method === 'GET' && url.pathname === '/api/contractor-desk/projects') {
      const user = authUser(req);
      return sendJson(res, 200, {
        projects: user ? listProjectRequests(db, { limit: Number(url.searchParams.get('limit') || 50), userId: user.id }) : [],
      });
    }

    if (req.method === 'POST' && url.pathname === '/api/contractor-desk/projects') {
      const user = ensureWriteAllowed(req);
      const body = await readJson(req);
      const project = createProjectRequest(db, { ...body, userId: user?.id || body.userId });
      return sendJson(res, 201, { project });
    }

    const projectMatch = url.pathname.match(/^\/api\/contractor-desk\/projects\/([^/]+)$/);
    if (req.method === 'GET' && projectMatch) {
      const user = requireUser(req);
      const project = getProjectRequest(db, decodeURIComponent(projectMatch[1]));
      if (project && !isAlterCraftAdmin(user) && project.userId !== user.id) {
        return sendJson(res, 403, { error: 'This project belongs to another user.' });
      }
      return project ? sendJson(res, 200, { project }) : sendJson(res, 404, { error: 'Project not found.' });
    }

    const childMatch = url.pathname.match(/^\/api\/contractor-desk\/projects\/([^/]+)\/(proofs|money|drafts)$/);
    if (req.method === 'POST' && childMatch) {
      const user = ensureWriteAllowed(req);
      const projectId = decodeURIComponent(childMatch[1]);
      const childType = childMatch[2];
      const body = await readJson(req);
      const project = getProjectRequest(db, projectId);
      if (user && project && !isAlterCraftAdmin(user) && project.userId !== user.id) {
        return sendJson(res, 403, { error: 'This project belongs to another user.' });
      }

      if (childType === 'proofs') {
        const proof = addSiteProof(db, projectId, body);
        return proof ? sendJson(res, 201, { proof }) : sendJson(res, 404, { error: 'Project not found.' });
      }

      if (childType === 'money') {
        const entry = addMoneyEntry(db, projectId, body);
        return entry ? sendJson(res, 201, { entry }) : sendJson(res, 404, { error: 'Project not found.' });
      }

      const draft = addMessageDraft(db, projectId, body);
      return draft ? sendJson(res, 201, { draft }) : sendJson(res, 404, { error: 'Project not found.' });
    }

    if (req.method === 'GET' && url.pathname === '/api/admin/dashboard') {
      requireAdmin(req);
      return sendJson(res, 200, getAdminDashboard(db));
    }

    if (req.method === 'GET' && url.pathname === '/api/admin/users') {
      requireAdmin(req);
      return sendJson(res, 200, { users: getAdminDashboard(db).users });
    }

    if (req.method === 'POST' && url.pathname === '/api/admin/users') {
      const admin = requireAdmin(req);
      const body = await readJson(req);
      const user = createUserAccount(db, body, admin.id);
      return sendJson(res, 201, { user });
    }

    const userMatch = url.pathname.match(/^\/api\/admin\/users\/([^/]+)$/);
    if (userMatch && req.method === 'GET') {
      requireAdmin(req);
      const workspace = getUserWorkspace(db, decodeURIComponent(userMatch[1]));
      return workspace ? sendJson(res, 200, workspace) : sendJson(res, 404, { error: 'User not found.' });
    }

    if (userMatch && req.method === 'PATCH') {
      const admin = requireAdmin(req);
      const body = await readJson(req);
      const user = updateUserAccount(db, decodeURIComponent(userMatch[1]), body, admin.id);
      return user ? sendJson(res, 200, { user }) : sendJson(res, 404, { error: 'User not found.' });
    }

    const userChildMatch = url.pathname.match(/^\/api\/admin\/users\/([^/]+)\/(notes|starter-data)$/);
    if (userChildMatch && req.method === 'POST') {
      const admin = requireAdmin(req);
      const userId = decodeURIComponent(userChildMatch[1]);
      const childType = userChildMatch[2];
      const body = await readJson(req);
      if (childType === 'notes') {
        const note = addAdminUserNote(db, userId, body, admin.id);
        return note ? sendJson(res, 201, { note }) : sendJson(res, 404, { error: 'User not found.' });
      }

      const workspace = createStarterDataForUser(db, userId, body, admin.id);
      return workspace ? sendJson(res, 201, workspace) : sendJson(res, 404, { error: 'User not found.' });
    }

    return sendJson(res, 404, { error: 'Not found.' });
  } catch (error) {
    const statusCode = Number(error?.statusCode || 500);
    return sendJson(res, statusCode, { error: error instanceof Error ? error.message : 'Server error.' });
  }
});

server.listen(port, () => {
  console.log(`AlterCraft central backend running on http://localhost:${port}`);
});
