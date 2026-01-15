import { query } from '../connection.js';
import type { Session } from '../../types/index.js';
import crypto from 'crypto';

const SESSION_EXPIRY_HOURS = parseInt(process.env.ADMIN_SESSION_EXPIRY || '24', 10);

export class SessionRepository {
  async findByToken(token: string): Promise<Session | null> {
    const result = await query<Session>(
      `SELECT * FROM sessions
       WHERE token = $1 AND expires_at > NOW()`,
      [token]
    );
    return result.rows[0] || null;
  }

  async findByUserId(userId: string): Promise<Session[]> {
    const result = await query<Session>(
      `SELECT * FROM sessions
       WHERE user_id = $1 AND expires_at > NOW()
       ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  async create(userId: string, ipAddress?: string, userAgent?: string): Promise<Session> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000);

    const result = await query<Session>(
      `INSERT INTO sessions (user_id, token, expires_at, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, token, expiresAt, ipAddress || null, userAgent || null]
    );

    return result.rows[0];
  }

  async delete(token: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM sessions WHERE token = $1',
      [token]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async deleteByUserId(userId: string): Promise<number> {
    const result = await query(
      'DELETE FROM sessions WHERE user_id = $1',
      [userId]
    );
    return result.rowCount ?? 0;
  }

  async deleteExpired(): Promise<number> {
    const result = await query(
      'DELETE FROM sessions WHERE expires_at < NOW()'
    );
    return result.rowCount ?? 0;
  }

  async extend(token: string): Promise<Session | null> {
    const expiresAt = new Date(Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000);

    const result = await query<Session>(
      `UPDATE sessions SET expires_at = $1
       WHERE token = $2 AND expires_at > NOW()
       RETURNING *`,
      [expiresAt, token]
    );

    return result.rows[0] || null;
  }
}

export const sessionRepository = new SessionRepository();
