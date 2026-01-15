import type { LoginRequest, LoginResponse, UserPublic, Session } from '../types/index.js';
export declare class AuthService {
    login(data: LoginRequest, ipAddress?: string, userAgent?: string): Promise<LoginResponse>;
    logout(sessionToken: string): Promise<boolean>;
    validateSession(sessionToken: string): Promise<{
        session: Session;
        user: UserPublic;
    } | null>;
    extendSession(sessionToken: string): Promise<Session | null>;
    logoutAllSessions(userId: string): Promise<number>;
    private logFailedLogin;
    cleanupExpiredSessions(): Promise<number>;
}
export declare const authService: AuthService;
//# sourceMappingURL=auth.service.d.ts.map