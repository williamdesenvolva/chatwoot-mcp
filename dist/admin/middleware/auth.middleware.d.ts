import type { IncomingMessage, ServerResponse } from 'http';
import type { UserPublic } from '../types/index.js';
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
export declare function validateAdminSession(req: IncomingMessage): Promise<{
    user: UserPublic;
    sessionToken: string;
} | null>;
export declare function requireRole(user: UserPublic | undefined, ...roles: string[]): boolean;
export declare function parseCookies(cookieHeader: string): Record<string, string>;
export declare function parseQueryString(queryString: string): Record<string, string>;
export declare function extractPathParams(pattern: string, path: string): Record<string, string> | null;
export declare function sendJson(res: ServerResponse, data: any, status?: number): void;
export declare function sendError(res: ServerResponse, message: string, status?: number): void;
//# sourceMappingURL=auth.middleware.d.ts.map