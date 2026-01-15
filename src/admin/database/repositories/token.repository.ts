import { query } from '../connection.js';
import type {
  ApiToken,
  ApiTokenPublic,
  ApiTokenWithUser,
  CreateTokenRequest,
  UpdateTokenRequest,
  TokenPermissions,
} from '../../types/index.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

export class TokenRepository {
  async findById(id: string): Promise<ApiToken | null> {
    const result = await query<ApiToken>(
      'SELECT * FROM api_tokens WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async findByIdWithUser(id: string): Promise<ApiTokenWithUser | null> {
    const result = await query<ApiTokenWithUser>(
      `SELECT t.id, t.user_id, t.name, t.token_prefix, t.chatwoot_account_id,
              t.permissions, t.rate_limit_per_minute, t.is_active, t.last_used_at,
              t.expires_at, t.created_at, u.email as user_email, u.name as user_name
       FROM api_tokens t
       JOIN users u ON t.user_id = u.id
       WHERE t.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async findByHash(tokenHash: string): Promise<ApiToken | null> {
    const result = await query<ApiToken>(
      'SELECT * FROM api_tokens WHERE token_hash = $1',
      [tokenHash]
    );
    return result.rows[0] || null;
  }

  async findByPrefix(prefix: string): Promise<ApiToken[]> {
    const result = await query<ApiToken>(
      'SELECT * FROM api_tokens WHERE token_prefix = $1',
      [prefix]
    );
    return result.rows;
  }

  async findAll(userId?: string, includeInactive = false): Promise<ApiTokenWithUser[]> {
    let whereConditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (userId) {
      whereConditions.push(`t.user_id = $${paramIndex++}`);
      params.push(userId);
    }

    if (!includeInactive) {
      whereConditions.push('t.is_active = true');
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const result = await query<ApiTokenWithUser>(
      `SELECT t.id, t.user_id, t.name, t.token_prefix, t.chatwoot_account_id,
              t.permissions, t.rate_limit_per_minute, t.is_active, t.last_used_at,
              t.expires_at, t.created_at, u.email as user_email, u.name as user_name
       FROM api_tokens t
       JOIN users u ON t.user_id = u.id
       ${whereClause}
       ORDER BY t.created_at DESC`,
      params
    );

    return result.rows;
  }

  async create(
    userId: string,
    data: CreateTokenRequest
  ): Promise<{ token: ApiTokenPublic; plainToken: string }> {
    // Generate secure random token
    const plainToken = `mcp_${crypto.randomBytes(32).toString('hex')}`;
    const tokenPrefix = plainToken.substring(0, 8);
    const tokenHash = await bcrypt.hash(plainToken, 10);

    const result = await query<ApiTokenPublic>(
      `INSERT INTO api_tokens (
        user_id, name, token_hash, token_prefix, chatwoot_account_id,
        permissions, rate_limit_per_minute, expires_at
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, user_id, name, token_prefix, chatwoot_account_id,
                 permissions, rate_limit_per_minute, is_active, last_used_at,
                 expires_at, created_at`,
      [
        userId,
        data.name,
        tokenHash,
        tokenPrefix,
        data.chatwoot_account_id || null,
        JSON.stringify(data.permissions),
        data.rate_limit_per_minute || 100,
        data.expires_at ? new Date(data.expires_at) : null,
      ]
    );

    return {
      token: result.rows[0],
      plainToken,
    };
  }

  async update(id: string, data: UpdateTokenRequest): Promise<ApiTokenPublic | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.chatwoot_account_id !== undefined) {
      updates.push(`chatwoot_account_id = $${paramIndex++}`);
      values.push(data.chatwoot_account_id);
    }
    if (data.permissions !== undefined) {
      updates.push(`permissions = $${paramIndex++}`);
      values.push(JSON.stringify(data.permissions));
    }
    if (data.rate_limit_per_minute !== undefined) {
      updates.push(`rate_limit_per_minute = $${paramIndex++}`);
      values.push(data.rate_limit_per_minute);
    }
    if (data.is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(data.is_active);
    }
    if (data.expires_at !== undefined) {
      updates.push(`expires_at = $${paramIndex++}`);
      values.push(data.expires_at ? new Date(data.expires_at) : null);
    }

    if (updates.length === 0) {
      const existing = await this.findById(id);
      return existing ? this.toPublic(existing) : null;
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query<ApiTokenPublic>(
      `UPDATE api_tokens SET ${updates.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, user_id, name, token_prefix, chatwoot_account_id,
                 permissions, rate_limit_per_minute, is_active, last_used_at,
                 expires_at, created_at`,
      values
    );

    return result.rows[0] || null;
  }

  async regenerate(id: string): Promise<{ token: ApiTokenPublic; plainToken: string } | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const plainToken = `mcp_${crypto.randomBytes(32).toString('hex')}`;
    const tokenPrefix = plainToken.substring(0, 8);
    const tokenHash = await bcrypt.hash(plainToken, 10);

    const result = await query<ApiTokenPublic>(
      `UPDATE api_tokens SET token_hash = $1, token_prefix = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING id, user_id, name, token_prefix, chatwoot_account_id,
                 permissions, rate_limit_per_minute, is_active, last_used_at,
                 expires_at, created_at`,
      [tokenHash, tokenPrefix, id]
    );

    if (!result.rows[0]) return null;

    return {
      token: result.rows[0],
      plainToken,
    };
  }

  async delete(id: string): Promise<boolean> {
    // Soft delete - deactivate instead of removing
    const result = await query(
      'UPDATE api_tokens SET is_active = false, updated_at = NOW() WHERE id = $1',
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async hardDelete(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM api_tokens WHERE id = $1',
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async updateLastUsed(id: string): Promise<void> {
    await query(
      'UPDATE api_tokens SET last_used_at = NOW() WHERE id = $1',
      [id]
    );
  }

  async validateToken(plainToken: string): Promise<ApiToken | null> {
    const prefix = plainToken.substring(0, 8);

    // Find tokens with matching prefix
    const candidates = await this.findByPrefix(prefix);

    for (const candidate of candidates) {
      if (!candidate.is_active) continue;

      // Check expiration
      if (candidate.expires_at && new Date(candidate.expires_at) < new Date()) {
        continue;
      }

      // Verify hash
      const isValid = await bcrypt.compare(plainToken, candidate.token_hash);
      if (isValid) {
        // Update last used asynchronously
        this.updateLastUsed(candidate.id).catch(console.error);
        return candidate;
      }
    }

    return null;
  }

  async count(activeOnly = true): Promise<number> {
    const whereClause = activeOnly ? 'WHERE is_active = true' : '';
    const result = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM api_tokens ${whereClause}`
    );
    return parseInt(result.rows[0].count, 10);
  }

  private toPublic(token: ApiToken): ApiTokenPublic {
    return {
      id: token.id,
      user_id: token.user_id,
      name: token.name,
      token_prefix: token.token_prefix,
      chatwoot_account_id: token.chatwoot_account_id,
      permissions: token.permissions,
      rate_limit_per_minute: token.rate_limit_per_minute,
      is_active: token.is_active,
      last_used_at: token.last_used_at,
      expires_at: token.expires_at,
      created_at: token.created_at,
    };
  }
}

export const tokenRepository = new TokenRepository();
