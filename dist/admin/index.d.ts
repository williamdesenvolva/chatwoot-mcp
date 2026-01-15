import type { IncomingMessage, ServerResponse } from 'http';
export declare function handleAdminRoute(req: IncomingMessage, res: ServerResponse, pathname: string, body: any): Promise<boolean>;
export { tokenService } from './services/token.service.js';
export { auditService } from './services/audit.service.js';
export { initializeDatabase } from './database/connection.js';
//# sourceMappingURL=index.d.ts.map