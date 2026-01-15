import type { AuditLog, AuditLogQuery, PaginatedResponse } from '../../types/index.js';
export declare class AuditRepository {
    create(data: Partial<AuditLog>): Promise<AuditLog>;
    findById(id: string): Promise<AuditLog | null>;
    findAll(queryParams: AuditLogQuery): Promise<PaginatedResponse<AuditLog>>;
    findRecent(limit?: number): Promise<AuditLog[]>;
    countByPeriod(startDate: Date, endDate: Date): Promise<number>;
    countToday(): Promise<number>;
    countThisWeek(): Promise<number>;
    deleteOlderThan(days: number): Promise<number>;
    getActionStats(days?: number): Promise<Array<{
        action: string;
        count: number;
    }>>;
}
export declare const auditRepository: AuditRepository;
//# sourceMappingURL=audit.repository.d.ts.map