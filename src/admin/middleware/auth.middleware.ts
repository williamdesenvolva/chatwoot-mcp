import type { IncomingMessage, ServerResponse } from 'http';
import { authService } from '../services/auth.service.js';
import type { UserPublic } from '../types/index.js';

// Extend request to include user info
export interface AuthenticatedRequest extends IncomingMessage {
  user?: UserPublic;
  sessionToken?: string;
}

export interface AdminRouteContext {
  user?: UserPublic;
  sessionToken?: string;
  body?: any;
  params?: Record<string, string>;
  query?: Record<string, string>;
}

export async function validateAdminSession(
  req: IncomingMessage
): Promise<{ user: UserPublic; sessionToken: string } | null> {
  // Get token from Authorization header or cookie
  const authHeader = req.headers['authorization'];
  let token: string | undefined;

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.headers['cookie']) {
    const cookies = parseCookies(req.headers['cookie']);
    token = cookies['admin_session'];
  }

  if (!token) {
    return null;
  }

  const validation = await authService.validateSession(token);
  if (!validation) {
    return null;
  }

  return {
    user: validation.user,
    sessionToken: token,
  };
}

export function requireRole(user: UserPublic | undefined, ...roles: string[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

export function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};

  cookieHeader.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });

  return cookies;
}

export function parseQueryString(queryString: string): Record<string, string> {
  const params: Record<string, string> = {};

  if (!queryString) return params;

  queryString.split('&').forEach(pair => {
    const [key, value] = pair.split('=');
    if (key) {
      params[decodeURIComponent(key)] = value ? decodeURIComponent(value) : '';
    }
  });

  return params;
}

export function extractPathParams(pattern: string, path: string): Record<string, string> | null {
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');

  if (patternParts.length !== pathParts.length) {
    return null;
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].substring(1)] = pathParts[i];
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }

  return params;
}

export function sendJson(
  res: ServerResponse,
  data: any,
  status = 200
): void {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
  });
  res.end(JSON.stringify(data));
}

export function sendError(
  res: ServerResponse,
  message: string,
  status = 400
): void {
  sendJson(res, { error: message }, status);
}
