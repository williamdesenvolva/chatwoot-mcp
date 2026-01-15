import type { CreateTokenRequest, CreateTokenResponse, UpdateTokenRequest, ApiTokenPublic, ApiTokenWithUser, TokenValidation, TokenPermissions, PermissionCategory, PermissionAction } from '../types/index.js';
export declare class TokenService {
    validateApiToken(token: string): Promise<TokenValidation>;
    getPermissionForEndpoint(method: string, path: string): {
        category: PermissionCategory;
        action: PermissionAction;
    } | null;
    hasPermission(permissions: TokenPermissions, category: PermissionCategory, action: PermissionAction): boolean;
    createToken(userId: string, data: CreateTokenRequest): Promise<CreateTokenResponse>;
    getTokens(userId?: string): Promise<ApiTokenWithUser[]>;
    getToken(id: string): Promise<ApiTokenWithUser | null>;
    updateToken(id: string, data: UpdateTokenRequest, updatedBy: string): Promise<ApiTokenPublic | null>;
    regenerateToken(id: string, regeneratedBy: string): Promise<{
        token: ApiTokenPublic;
        plain_token: string;
    } | null>;
    revokeToken(id: string, revokedBy: string): Promise<boolean>;
    getStats(): Promise<{
        total: number;
        active: number;
    }>;
    private getFullPermissions;
}
export declare const tokenService: TokenService;
//# sourceMappingURL=token.service.d.ts.map