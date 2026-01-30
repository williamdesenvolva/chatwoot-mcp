import { query } from '../connection.js';
export class ToolInstructionRepository {
    async findAll() {
        const result = await query('SELECT * FROM tool_instructions ORDER BY tool_name ASC');
        return result.rows;
    }
    async findByToolName(toolName) {
        const result = await query('SELECT * FROM tool_instructions WHERE tool_name = $1', [toolName]);
        return result.rows[0] || null;
    }
    async findById(id) {
        const result = await query('SELECT * FROM tool_instructions WHERE id = $1', [id]);
        return result.rows[0] || null;
    }
    async findEnabled() {
        const result = await query('SELECT * FROM tool_instructions WHERE is_enabled = true ORDER BY tool_name ASC');
        return result.rows;
    }
    async upsert(toolName, data, userId) {
        const existing = await this.findByToolName(toolName);
        if (existing) {
            // Update existing record
            const updates = [];
            const values = [];
            let paramIndex = 1;
            if (data.custom_description !== undefined) {
                updates.push(`custom_description = $${paramIndex++}`);
                values.push(data.custom_description);
            }
            if (data.is_enabled !== undefined) {
                updates.push(`is_enabled = $${paramIndex++}`);
                values.push(data.is_enabled);
            }
            if (userId) {
                updates.push(`updated_by = $${paramIndex++}`);
                values.push(userId);
            }
            updates.push(`updated_at = NOW()`);
            values.push(toolName);
            const result = await query(`UPDATE tool_instructions SET ${updates.join(', ')} WHERE tool_name = $${paramIndex}
         RETURNING id, tool_name, custom_description, is_enabled, created_at, updated_at`, values);
            return result.rows[0];
        }
        else {
            // Insert new record
            const result = await query(`INSERT INTO tool_instructions (tool_name, custom_description, is_enabled, created_by, updated_by)
         VALUES ($1, $2, $3, $4, $4)
         RETURNING id, tool_name, custom_description, is_enabled, created_at, updated_at`, [
                toolName,
                data.custom_description || null,
                data.is_enabled !== undefined ? data.is_enabled : true,
                userId || null,
            ]);
            return result.rows[0];
        }
    }
    async delete(toolName) {
        const result = await query('DELETE FROM tool_instructions WHERE tool_name = $1', [toolName]);
        return (result.rowCount ?? 0) > 0;
    }
    async deleteById(id) {
        const result = await query('DELETE FROM tool_instructions WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    }
    async count() {
        const result = await query('SELECT COUNT(*) as count FROM tool_instructions');
        return parseInt(result.rows[0].count, 10);
    }
    async countEnabled() {
        const result = await query('SELECT COUNT(*) as count FROM tool_instructions WHERE is_enabled = true');
        return parseInt(result.rows[0].count, 10);
    }
    toPublic(instruction) {
        return {
            id: instruction.id,
            tool_name: instruction.tool_name,
            custom_description: instruction.custom_description,
            is_enabled: instruction.is_enabled,
            created_at: instruction.created_at,
            updated_at: instruction.updated_at,
        };
    }
}
export const toolInstructionRepository = new ToolInstructionRepository();
//# sourceMappingURL=tool-instruction.repository.js.map