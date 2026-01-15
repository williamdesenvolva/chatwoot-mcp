import { auditRepository } from '../database/repositories/audit.repository.js';
import { tokenRepository } from '../database/repositories/token.repository.js';
import { userRepository } from '../database/repositories/user.repository.js';
import type { AuditLog, AuditLogQuery, PaginatedResponse, DashboardStats } from '../types/index.js';

export class AuditService {
  async logApiRequest(
    tokenId: string | undefined,
    method: string,
    path: string,
    status: number,
    ipAddress?: string,
    userAgent?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await auditRepository.create({
        api_token_id: tokenId,
        action: `api.${method.toLowerCase()}.${this.pathToAction(path)}`,
        request_method: method,
        request_path: path,
        response_status: status,
        ip_address: ipAddress,
        user_agent: userAgent,
        metadata,
      });
    } catch (error) {
      // Don't fail the request if audit logging fails
      console.error('[Audit] Failed to log API request:', error);
    }
  }

  async getAuditLogs(query: AuditLogQuery): Promise<PaginatedResponse<AuditLog>> {
    return auditRepository.findAll(query);
  }

  async getRecentLogs(limit = 10): Promise<AuditLog[]> {
    return auditRepository.findById(limit.toString()).then(() => auditRepository.findRecent(limit));
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const [
      totalTokens,
      activeTokens,
      totalUsers,
      apiCallsToday,
      apiCallsWeek,
      recentLogs,
    ] = await Promise.all([
      tokenRepository.count(false),
      tokenRepository.count(true),
      userRepository.count(),
      auditRepository.countToday(),
      auditRepository.countThisWeek(),
      auditRepository.findRecent(10),
    ]);

    return {
      total_tokens: totalTokens,
      active_tokens: activeTokens,
      total_users: totalUsers,
      api_calls_today: apiCallsToday,
      api_calls_week: apiCallsWeek,
      recent_logs: recentLogs,
    };
  }

  async getActionStats(days = 7): Promise<Array<{ action: string; count: number }>> {
    return auditRepository.getActionStats(days);
  }

  async cleanupOldLogs(retentionDays = 90): Promise<number> {
    const deleted = await auditRepository.deleteOlderThan(retentionDays);
    console.log(`[Audit] Cleaned up ${deleted} audit logs older than ${retentionDays} days`);
    return deleted;
  }

  private pathToAction(path: string): string {
    // Convert /contacts/123 to contacts
    // Convert /conversations/123/messages to conversations.messages
    return path
      .replace(/^\//, '')
      .replace(/\/[0-9a-f-]+/gi, '')
      .replace(/\/\d+/g, '')
      .replace(/\//g, '.')
      .replace(/^\.+|\.+$/g, '')
      || 'unknown';
  }
}

export const auditService = new AuditService();
