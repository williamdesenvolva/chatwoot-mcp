import type { ToolInstruction, ToolInstructionPublic, UpsertToolInstructionRequest } from '../../types/index.js';
export declare class ToolInstructionRepository {
    findAll(): Promise<ToolInstruction[]>;
    findByToolName(toolName: string): Promise<ToolInstruction | null>;
    findById(id: string): Promise<ToolInstruction | null>;
    findEnabled(): Promise<ToolInstruction[]>;
    upsert(toolName: string, data: UpsertToolInstructionRequest, userId?: string): Promise<ToolInstructionPublic>;
    delete(toolName: string): Promise<boolean>;
    deleteById(id: string): Promise<boolean>;
    count(): Promise<number>;
    countEnabled(): Promise<number>;
    toPublic(instruction: ToolInstruction): ToolInstructionPublic;
}
export declare const toolInstructionRepository: ToolInstructionRepository;
//# sourceMappingURL=tool-instruction.repository.d.ts.map