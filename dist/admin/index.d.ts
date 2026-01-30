import type { IncomingMessage, ServerResponse } from 'http';
import { type McpTool } from './services/tool-instruction.service.js';
export declare function handleAdminRoute(req: IncomingMessage, res: ServerResponse, pathname: string, body: any, mcpTools?: McpTool[]): Promise<boolean>;
export { tokenService } from './services/token.service.js';
export { auditService } from './services/audit.service.js';
export { toolInstructionService } from './services/tool-instruction.service.js';
export { initializeDatabase } from './database/connection.js';
//# sourceMappingURL=index.d.ts.map