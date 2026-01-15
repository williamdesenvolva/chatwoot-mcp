import type { AuditLog, AuditLogQuery, PaginatedResponse, DashboardStats } from '../types/index.js';
export declare class AuditService {
    logApiRequest(tokenId: string | undefined, method: string, path: string, status: number, ipAddress?: string, userAgent?: string, metadata?: Record<string, any>): Promise<void>;
    getAuditLogs(query: AuditLogQuery): Promise<PaginatedResponse<AuditLog>>;
    getRecentLogs(limit?: number): Promise<AuditLog[]>;
    getDashboardStats(): Promise<DashboardStats>;
    getActionStats(days?: number): Promise<Array<{
        action: string;
        count: number;
    }>>;
    cleanupOldLogs(retentionDays?: number): Promise<number>;
    private pathToAction;
}
export declare const auditService: AuditService;
//# sourceMappingURL=audit.service.d.ts.map