import { query } from '../connection.js';
import bcrypt from 'bcrypt';
export class UserRepository {
    async findById(id) {
        const result = await query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows[0] || null;
    }
    async findByEmail(email) {
        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0] || null;
    }
    async findAll(includeInactive = false) {
        const whereClause = includeInactive ? '' : 'WHERE is_active = true';
        const result = await query(`SELECT id, email, name, role, is_active, created_at FROM users ${whereClause} ORDER BY created_at DESC`);
        return result.rows;
    }
    async create(data) {
        const passwordHash = await bcrypt.hash(data.password, 12);
        const result = await query(`INSERT INTO users (email, password_hash, name, role, is_active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, email, name, role, is_active, created_at`, [data.email, passwordHash, data.name || null, data.role || 'admin']);
        return result.rows[0];
    }
    async update(id, data) {
        const updates = [];
        const values = [];
        let paramIndex = 1;
        if (data.email !== undefined) {
            updates.push(`email = $${paramIndex++}`);
            values.push(data.email);
        }
        if (data.password !== undefined) {
            const passwordHash = await bcrypt.hash(data.password, 12);
            updates.push(`password_hash = $${paramIndex++}`);
            values.push(passwordHash);
        }
        if (data.name !== undefined) {
            updates.push(`name = $${paramIndex++}`);
            values.push(data.name);
        }
        if (data.role !== undefined) {
            updates.push(`role = $${paramIndex++}`);
            values.push(data.role);
        }
        if (data.is_active !== undefined) {
            updates.push(`is_active = $${paramIndex++}`);
            values.push(data.is_active);
        }
        if (updates.length === 0) {
            return this.findById(id).then(user => user ? this.toPublic(user) : null);
        }
        updates.push(`updated_at = NOW()`);
        values.push(id);
        const result = await query(`UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, email, name, role, is_active, created_at`, values);
        return result.rows[0] || null;
    }
    async delete(id) {
        // Soft delete - just deactivate
        const result = await query('UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    }
    async verifyPassword(user, password) {
        return bcrypt.compare(password, user.password_hash);
    }
    async count() {
        const result = await query('SELECT COUNT(*) as count FROM users WHERE is_active = true');
        return parseInt(result.rows[0].count, 10);
    }
    toPublic(user) {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            is_active: user.is_active,
            created_at: user.created_at,
        };
    }
}
export const userRepository = new UserRepository();
//# sourceMappingURL=user.repository.js.map