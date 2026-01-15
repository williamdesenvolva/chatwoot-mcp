import { query } from '../connection.js';
export class AuditRepository {
    async create(data) {
        const result = await query(`INSERT INTO audit_logs (
        user_id, api_token_id, action, resource_type, resource_id,
        request_method, request_path, response_status, ip_address, user_agent, metadata
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`, [
            data.user_id || null,
            data.api_token_id || null,
            data.action || 'unknown',
            data.resource_type || null,
            data.resource_id || null,
            data.request_method || null,
            data.request_path || null,
            data.response_status || null,
            data.ip_address || null,
            data.user_agent || null,
            JSON.stringify(data.metadata || {}),
        ]);
        return result.rows[0];
    }
    async findById(id) {
        const result = await query('SELECT * FROM audit_logs WHERE id = $1', [id]);
        return result.rows[0] || null;
    }
    async findAll(queryParams) {
        const page = queryParams.page || 1;
        const limit = Math.min(queryParams.limit || 50, 100);
        const offset = (page - 1) * limit;
        const conditions = [];
        const params = [];
        let paramIndex = 1;
        if (queryParams.action) {
            conditions.push(`action LIKE $${paramIndex++}`);
            params.push(`%${queryParams.action}%`);
        }
        if (queryParams.api_token_id) {
            conditions.push(`api_token_id = $${paramIndex++}`);
            params.push(queryParams.api_token_id);
        }
        if (queryParams.user_id) {
            conditions.push(`user_id = $${paramIndex++}`);
            params.push(queryParams.user_id);
        }
        if (queryParams.from_date) {
            conditions.push(`created_at >= $${paramIndex++}`);
            params.push(new Date(queryParams.from_date));
        }
        if (queryParams.to_date) {
            conditions.push(`created_at <= $${paramIndex++}`);
            params.push(new Date(queryParams.to_date));
        }
        const whereClause = conditions.length > 0
            ? `WHERE ${conditions.join(' AND ')}`
            : '';
        // Get total count
        const countResult = await query(`SELECT COUNT(*) as count FROM audit_logs ${whereClause}`, params);
        const total = parseInt(countResult.rows[0].count, 10);
        // Get paginated results
        params.push(limit, offset);
        const result = await query(`SELECT * FROM audit_logs ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`, params);
        return {
            data: result.rows,
            pagination: {
                page,
                limit,
                total,
                total_pages: Math.ceil(total / limit),
            },
        };
    }
    async findRecent(limit = 10) {
        const result = await query(`SELECT * FROM audit_logs
       ORDER BY created_at DESC
       LIMIT $1`, [limit]);
        return result.rows;
    }
    async countByPeriod(startDate, endDate) {
        const result = await query(`SELECT COUNT(*) as count FROM audit_logs
       WHERE created_at >= $1 AND created_at <= $2`, [startDate, endDate]);
        return parseInt(result.rows[0].count, 10);
    }
    async countToday() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return this.countByPeriod(today, tomorrow);
    }
    async countThisWeek() {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        return this.countByPeriod(weekStart, now);
    }
    async deleteOlderThan(days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const result = await query('DELETE FROM audit_logs WHERE created_at < $1', [cutoffDate]);
        return result.rowCount ?? 0;
    }
    async getActionStats(days = 7) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const result = await query(`SELECT action, COUNT(*) as count FROM audit_logs
       WHERE created_at >= $1
       GROUP BY action
       ORDER BY count DESC
       LIMIT 20`, [cutoffDate]);
        return result.rows.map(row => ({
            action: row.action,
            count: parseInt(row.count, 10),
        }));
    }
}
export const auditRepository = new AuditRepository();
//# sourceMappingURL=audit.repository.js.map