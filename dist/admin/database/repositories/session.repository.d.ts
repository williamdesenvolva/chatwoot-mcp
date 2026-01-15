import type { Session } from '../../types/index.js';
export declare class SessionRepository {
    findByToken(token: string): Promise<Session | null>;
    findByUserId(userId: string): Promise<Session[]>;
    create(userId: string, ipAddress?: string, userAgent?: string): Promise<Session>;
    delete(token: string): Promise<boolean>;
    deleteByUserId(userId: string): Promise<number>;
    deleteExpired(): Promise<number>;
    extend(token: string): Promise<Session | null>;
}
export declare const sessionRepository: SessionRepository;
//# sourceMappingURL=session.repository.d.ts.map