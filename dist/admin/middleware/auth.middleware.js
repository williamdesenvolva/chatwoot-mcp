import { authService } from '../services/auth.service.js';
export async function validateAdminSession(req) {
    // Get token from Authorization header or cookie
    const authHeader = req.headers['authorization'];
    let token;
    if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
    }
    else if (req.headers['cookie']) {
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
export function requireRole(user, ...roles) {
    if (!user)
        return false;
    return roles.includes(user.role);
}
export function parseCookies(cookieHeader) {
    const cookies = {};
    cookieHeader.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name && value) {
            cookies[name] = decodeURIComponent(value);
        }
    });
    return cookies;
}
export function parseQueryString(queryString) {
    const params = {};
    if (!queryString)
        return params;
    queryString.split('&').forEach(pair => {
        const [key, value] = pair.split('=');
        if (key) {
            params[decodeURIComponent(key)] = value ? decodeURIComponent(value) : '';
        }
    });
    return params;
}
export function extractPathParams(pattern, path) {
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');
    if (patternParts.length !== pathParts.length) {
        return null;
    }
    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
        if (patternParts[i].startsWith(':')) {
            params[patternParts[i].substring(1)] = pathParts[i];
        }
        else if (patternParts[i] !== pathParts[i]) {
            return null;
        }
    }
    return params;
}
export function sendJson(res, data, status = 200) {
    res.writeHead(status, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
    });
    res.end(JSON.stringify(data));
}
export function sendError(res, message, status = 400) {
    sendJson(res, { error: message }, status);
}
//# sourceMappingURL=auth.middleware.js.map