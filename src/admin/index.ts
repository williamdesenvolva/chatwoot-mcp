import type { IncomingMessage, ServerResponse } from 'http';
import { URL } from 'url';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { authService } from './services/auth.service.js';
import { userService } from './services/user.service.js';
import { tokenService } from './services/token.service.js';
import { auditService } from './services/audit.service.js';
import {
  validateAdminSession,
  requireRole,
  extractPathParams,
  parseQueryString,
  sendJson,
  sendError,
} from './middleware/auth.middleware.js';
import type { UserPublic } from './types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static file serving for admin panel
const ADMIN_PANEL_DIR = path.join(__dirname, '../../admin-panel/dist');

export async function handleAdminRoute(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  body: any
): Promise<boolean> {
  const method = req.method?.toUpperCase() || 'GET';
  const url = new URL(pathname, 'http://localhost');
  const query = parseQueryString(url.search.substring(1));

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      'Access-Control-Max-Age': '86400',
    });
    res.end();
    return true;
  }

  // Get client info for audit logging
  const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'];

  // ========== PUBLIC ROUTES (no auth required) ==========

  // POST /admin/auth/login
  if (pathname === '/admin/auth/login' && method === 'POST') {
    try {
      if (!body?.email || !body?.password) {
        sendError(res, 'Email and password are required', 400);
        return true;
      }

      const result = await authService.login(body, ipAddress, userAgent);

      // Set session cookie
      res.setHeader('Set-Cookie', [
        `admin_session=${result.token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`,
      ]);

      sendJson(res, result);
    } catch (error: any) {
      sendError(res, error.message || 'Login failed', 401);
    }
    return true;
  }

  // ========== DETERMINE IF THIS IS AN API REQUEST ==========
  // API requests: have Authorization header OR are POST/PATCH/DELETE
  // Browser navigation: GET without auth header
  const hasAuthHeader = !!req.headers['authorization'];
  const isApiMethod = method !== 'GET' && method !== 'HEAD';
  const isApiRequest = hasAuthHeader || isApiMethod;

  // For browser navigation (no auth header, GET request), serve static files
  if (!isApiRequest && method === 'GET') {
    return serveStaticFile(res, pathname);
  }

  // ========== PROTECTED API ROUTES (auth required) ==========
  const authResult = await validateAdminSession(req);
  if (!authResult) {
    sendError(res, 'Unauthorized', 401);
    return true;
  }

  const { user, sessionToken } = authResult;

  // POST /admin/auth/logout
  if (pathname === '/admin/auth/logout' && method === 'POST') {
    await authService.logout(sessionToken);
    res.setHeader('Set-Cookie', 'admin_session=; HttpOnly; Path=/; Max-Age=0');
    sendJson(res, { success: true });
    return true;
  }

  // GET /admin/auth/me
  if (pathname === '/admin/auth/me' && method === 'GET') {
    sendJson(res, { user });
    return true;
  }

  // ========== USERS ROUTES (superadmin only for most) ==========

  // GET /admin/users
  if (pathname === '/admin/users' && method === 'GET') {
    if (!requireRole(user, 'superadmin')) {
      sendError(res, 'Forbidden', 403);
      return true;
    }
    const users = await userService.getUsers(query.include_inactive === 'true');
    sendJson(res, { data: users });
    return true;
  }

  // POST /admin/users
  if (pathname === '/admin/users' && method === 'POST') {
    if (!requireRole(user, 'superadmin')) {
      sendError(res, 'Forbidden', 403);
      return true;
    }
    try {
      const newUser = await userService.createUser(body, user.id);
      sendJson(res, { data: newUser }, 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to create user', 400);
    }
    return true;
  }

  // GET /admin/users/:id
  let params = extractPathParams('/admin/users/:id', pathname);
  if (params && method === 'GET') {
    if (!requireRole(user, 'superadmin')) {
      sendError(res, 'Forbidden', 403);
      return true;
    }
    const targetUser = await userService.getUser(params.id);
    if (!targetUser) {
      sendError(res, 'User not found', 404);
      return true;
    }
    sendJson(res, { data: targetUser });
    return true;
  }

  // PATCH /admin/users/:id
  params = extractPathParams('/admin/users/:id', pathname);
  if (params && method === 'PATCH') {
    if (!requireRole(user, 'superadmin')) {
      sendError(res, 'Forbidden', 403);
      return true;
    }
    try {
      const updatedUser = await userService.updateUser(params.id, body, user.id);
      if (!updatedUser) {
        sendError(res, 'User not found', 404);
        return true;
      }
      sendJson(res, { data: updatedUser });
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update user', 400);
    }
    return true;
  }

  // DELETE /admin/users/:id
  params = extractPathParams('/admin/users/:id', pathname);
  if (params && method === 'DELETE') {
    if (!requireRole(user, 'superadmin')) {
      sendError(res, 'Forbidden', 403);
      return true;
    }
    try {
      const deleted = await userService.deleteUser(params.id, user.id);
      if (!deleted) {
        sendError(res, 'User not found', 404);
        return true;
      }
      sendJson(res, { success: true });
    } catch (error: any) {
      sendError(res, error.message || 'Failed to delete user', 400);
    }
    return true;
  }

  // ========== TOKENS ROUTES ==========

  // GET /admin/tokens
  if (pathname === '/admin/tokens' && method === 'GET') {
    // Admins see their own tokens, superadmins see all
    const userId = requireRole(user, 'superadmin') ? undefined : user.id;
    const tokens = await tokenService.getTokens(userId);
    sendJson(res, { data: tokens });
    return true;
  }

  // POST /admin/tokens
  if (pathname === '/admin/tokens' && method === 'POST') {
    try {
      if (!body?.name || !body?.permissions) {
        sendError(res, 'Name and permissions are required', 400);
        return true;
      }
      const result = await tokenService.createToken(user.id, body);
      sendJson(res, result, 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to create token', 400);
    }
    return true;
  }

  // GET /admin/tokens/:id
  params = extractPathParams('/admin/tokens/:id', pathname);
  if (params && method === 'GET') {
    const token = await tokenService.getToken(params.id);
    if (!token) {
      sendError(res, 'Token not found', 404);
      return true;
    }
    // Non-superadmins can only see their own tokens
    if (!requireRole(user, 'superadmin') && token.user_id !== user.id) {
      sendError(res, 'Forbidden', 403);
      return true;
    }
    sendJson(res, { data: token });
    return true;
  }

  // PATCH /admin/tokens/:id
  params = extractPathParams('/admin/tokens/:id', pathname);
  if (params && method === 'PATCH') {
    const token = await tokenService.getToken(params.id);
    if (!token) {
      sendError(res, 'Token not found', 404);
      return true;
    }
    if (!requireRole(user, 'superadmin') && token.user_id !== user.id) {
      sendError(res, 'Forbidden', 403);
      return true;
    }
    try {
      const updated = await tokenService.updateToken(params.id, body, user.id);
      sendJson(res, { data: updated });
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update token', 400);
    }
    return true;
  }

  // DELETE /admin/tokens/:id
  params = extractPathParams('/admin/tokens/:id', pathname);
  if (params && method === 'DELETE') {
    const token = await tokenService.getToken(params.id);
    if (!token) {
      sendError(res, 'Token not found', 404);
      return true;
    }
    if (!requireRole(user, 'superadmin') && token.user_id !== user.id) {
      sendError(res, 'Forbidden', 403);
      return true;
    }
    await tokenService.revokeToken(params.id, user.id);
    sendJson(res, { success: true });
    return true;
  }

  // POST /admin/tokens/:id/regenerate
  params = extractPathParams('/admin/tokens/:id/regenerate', pathname);
  if (params && method === 'POST') {
    const token = await tokenService.getToken(params.id);
    if (!token) {
      sendError(res, 'Token not found', 404);
      return true;
    }
    if (!requireRole(user, 'superadmin') && token.user_id !== user.id) {
      sendError(res, 'Forbidden', 403);
      return true;
    }
    const result = await tokenService.regenerateToken(params.id, user.id);
    if (!result) {
      sendError(res, 'Failed to regenerate token', 500);
      return true;
    }
    sendJson(res, result);
    return true;
  }

  // ========== AUDIT ROUTES ==========

  // GET /admin/audit
  if (pathname === '/admin/audit' && method === 'GET') {
    const logs = await auditService.getAuditLogs({
      page: parseInt(query.page || '1', 10),
      limit: parseInt(query.limit || '50', 10),
      action: query.action,
      api_token_id: query.token_id,
      user_id: query.user_id,
      from_date: query.from_date,
      to_date: query.to_date,
    });
    sendJson(res, logs);
    return true;
  }

  // GET /admin/stats
  if (pathname === '/admin/stats' && method === 'GET') {
    const stats = await auditService.getDashboardStats();
    sendJson(res, stats);
    return true;
  }

  // API route not found
  return false;
}

// Serve static files for admin panel
function serveStaticFile(res: ServerResponse, pathname: string): boolean {
  // Map /admin to /admin/index.html
  let filePath = pathname === '/admin' || pathname === '/admin/'
    ? path.join(ADMIN_PANEL_DIR, 'index.html')
    : path.join(ADMIN_PANEL_DIR, pathname.replace('/admin', ''));

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    // For SPA routing, serve index.html for non-asset paths
    if (!pathname.includes('.')) {
      filePath = path.join(ADMIN_PANEL_DIR, 'index.html');
    }
  }

  if (!fs.existsSync(filePath)) {
    // Return false to indicate route not handled (will show 404)
    return false;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentTypes: Record<string, string> = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
  };

  const contentType = contentTypes[ext] || 'application/octet-stream';
  const content = fs.readFileSync(filePath);

  res.writeHead(200, { 'Content-Type': contentType });
  res.end(content);
  return true;
}

// Re-export services for use in http-server.ts
export { tokenService } from './services/token.service.js';
export { auditService } from './services/audit.service.js';
export { initializeDatabase } from './database/connection.js';
