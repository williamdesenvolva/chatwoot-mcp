import pg from 'pg';
export declare const pool: import("pg").Pool;
export declare function initializeDatabase(): Promise<void>;
export declare function query<T extends pg.QueryResultRow = any>(text: string, params?: any[]): Promise<pg.QueryResult<T>>;
export declare function withTransaction<T>(callback: (client: pg.PoolClient) => Promise<T>): Promise<T>;
export declare function closeDatabase(): Promise<void>;
//# sourceMappingURL=connection.d.ts.map