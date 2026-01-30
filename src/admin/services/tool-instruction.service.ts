import { toolInstructionRepository } from '../database/repositories/tool-instruction.repository.js';
import { auditRepository } from '../database/repositories/audit.repository.js';
import type {
  ToolInstruction,
  ToolInstructionPublic,
  UpsertToolInstructionRequest,
  ToolWithInstruction,
} from '../types/index.js';

export interface McpTool {
  name: string;
  description: string;
  inputSchema?: Record<string, any>;
}

export class ToolInstructionService {
  async getAllToolsWithInstructions(mcpTools: McpTool[]): Promise<ToolWithInstruction[]> {
    const customInstructions = await toolInstructionRepository.findAll();
    const instructionMap = new Map(
      customInstructions.map((inst) => [inst.tool_name, inst])
    );

    return mcpTools.map((tool) => {
      const custom = instructionMap.get(tool.name);
      return {
        name: tool.name,
        description: custom?.custom_description || tool.description,
        default_description: tool.description,
        custom_description: custom?.custom_description || null,
        is_enabled: custom?.is_enabled !== false,
        has_custom_instruction: !!custom?.custom_description,
        inputSchema: tool.inputSchema,
      };
    });
  }

  async getToolWithInstruction(
    toolName: string,
    mcpTools: McpTool[]
  ): Promise<ToolWithInstruction | null> {
    const tool = mcpTools.find((t) => t.name === toolName);
    if (!tool) return null;

    const custom = await toolInstructionRepository.findByToolName(toolName);

    return {
      name: tool.name,
      description: custom?.custom_description || tool.description,
      default_description: tool.description,
      custom_description: custom?.custom_description || null,
      is_enabled: custom?.is_enabled !== false,
      has_custom_instruction: !!custom?.custom_description,
      inputSchema: tool.inputSchema,
    };
  }

  async upsertInstruction(
    toolName: string,
    data: UpsertToolInstructionRequest,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<ToolInstructionPublic> {
    const result = await toolInstructionRepository.upsert(toolName, data, userId);

    // Log the action
    try {
      await auditRepository.create({
        user_id: userId,
        action: 'admin.tools.update',
        resource_type: 'tool_instruction',
        resource_id: toolName,
        ip_address: ipAddress,
        user_agent: userAgent,
        metadata: {
          custom_description: data.custom_description,
          is_enabled: data.is_enabled,
        },
      });
    } catch (error) {
      console.error('[Audit] Failed to log tool instruction update:', error);
    }

    return result;
  }

  async deleteInstruction(
    toolName: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<boolean> {
    const deleted = await toolInstructionRepository.delete(toolName);

    if (deleted) {
      // Log the action
      try {
        await auditRepository.create({
          user_id: userId,
          action: 'admin.tools.reset',
          resource_type: 'tool_instruction',
          resource_id: toolName,
          ip_address: ipAddress,
          user_agent: userAgent,
        });
      } catch (error) {
        console.error('[Audit] Failed to log tool instruction reset:', error);
      }
    }

    return deleted;
  }

  async getEnabledTools(mcpTools: McpTool[]): Promise<McpTool[]> {
    const customInstructions = await toolInstructionRepository.findAll();
    const instructionMap = new Map(
      customInstructions.map((inst) => [inst.tool_name, inst])
    );

    return mcpTools
      .filter((tool) => {
        const custom = instructionMap.get(tool.name);
        return custom?.is_enabled !== false;
      })
      .map((tool) => {
        const custom = instructionMap.get(tool.name);
        return {
          ...tool,
          description: custom?.custom_description || tool.description,
        };
      });
  }

  async getCustomInstructions(): Promise<ToolInstruction[]> {
    return toolInstructionRepository.findAll();
  }
}

export const toolInstructionService = new ToolInstructionService();
