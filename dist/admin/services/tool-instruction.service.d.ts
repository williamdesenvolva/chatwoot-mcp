import type { ToolInstruction, ToolInstructionPublic, UpsertToolInstructionRequest, ToolWithInstruction } from '../types/index.js';
export interface McpTool {
    name: string;
    description: string;
    inputSchema?: Record<string, any>;
}
export declare class ToolInstructionService {
    getAllToolsWithInstructions(mcpTools: McpTool[]): Promise<ToolWithInstruction[]>;
    getToolWithInstruction(toolName: string, mcpTools: McpTool[]): Promise<ToolWithInstruction | null>;
    upsertInstruction(toolName: string, data: UpsertToolInstructionRequest, userId?: string, ipAddress?: string, userAgent?: string): Promise<ToolInstructionPublic>;
    deleteInstruction(toolName: string, userId?: string, ipAddress?: string, userAgent?: string): Promise<boolean>;
    getEnabledTools(mcpTools: McpTool[]): Promise<McpTool[]>;
    getCustomInstructions(): Promise<ToolInstruction[]>;
}
export declare const toolInstructionService: ToolInstructionService;
//# sourceMappingURL=tool-instruction.service.d.ts.map