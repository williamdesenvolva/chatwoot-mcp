import type { ApiToken, ApiTokenPublic, ApiTokenWithUser, CreateTokenRequest, UpdateTokenRequest } from '../../types/index.js';
export declare class TokenRepository {
    findById(id: string): Promise<ApiToken | null>;
    findByIdWithUser(id: string): Promise<ApiTokenWithUser | null>;
    findByHash(tokenHash: string): Promise<ApiToken | null>;
    findByPrefix(prefix: string): Promise<ApiToken[]>;
    findAll(userId?: string, includeInactive?: boolean): Promise<ApiTokenWithUser[]>;
    create(userId: string, data: CreateTokenRequest): Promise<{
        token: ApiTokenPublic;
        plainToken: string;
    }>;
    update(id: string, data: UpdateTokenRequest): Promise<ApiTokenPublic | null>;
    regenerate(id: string): Promise<{
        token: ApiTokenPublic;
        plainToken: string;
    } | null>;
    delete(id: string): Promise<boolean>;
    hardDelete(id: string): Promise<boolean>;
    updateLastUsed(id: string): Promise<void>;
    validateToken(plainToken: string): Promise<ApiToken | null>;
    count(activeOnly?: boolean): Promise<number>;
    private toPublic;
}
export declare const tokenRepository: TokenRepository;
//# sourceMappingURL=token.repository.d.ts.map