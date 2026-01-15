import { tokenRepository } from '../database/repositories/token.repository.js';
import { auditRepository } from '../database/repositories/audit.repository.js';
import type {
  CreateTokenRequest,
  CreateTokenResponse,
  UpdateTokenRequest,
  ApiTokenPublic,
  ApiTokenWithUser,
  TokenValidation,
  TokenPermissions,
  PermissionCategory,
  PermissionAction,
  FULL_PERMISSIONS,
} from '../types/index.js';

// Legacy API key for backward compatibility
const LEGACY_API_KEY = process.env.MCP_API_KEY;

// Endpoint to permission category mapping
const ENDPOINT_PERMISSION_MAP: Record<string, { category: PermissionCategory; action: PermissionAction }> = {
  // Contacts
  'GET /contacts': { category: 'contacts', action: 'read' },
  'POST /contacts': { category: 'contacts', action: 'write' },
  'GET /contacts/:id': { category: 'contacts', action: 'read' },
  'PATCH /contacts/:id': { category: 'contacts', action: 'write' },
  'DELETE /contacts/:id': { category: 'contacts', action: 'delete' },
  'GET /contacts/search': { category: 'contacts', action: 'read' },
  'POST /contacts/filter': { category: 'contacts', action: 'read' },
  'GET /contacts/:id/conversations': { category: 'contacts', action: 'read' },

  // Conversations
  'GET /conversations': { category: 'conversations', action: 'read' },
  'POST /conversations': { category: 'conversations', action: 'write' },
  'GET /conversations/:id': { category: 'conversations', action: 'read' },
  'PATCH /conversations/:id': { category: 'conversations', action: 'write' },
  'POST /conversations/:id/toggle_status': { category: 'conversations', action: 'write' },
  'POST /conversations/:id/assignments': { category: 'conversations', action: 'write' },
  'GET /conversations/:id/labels': { category: 'conversations', action: 'read' },
  'POST /conversations/:id/labels': { category: 'conversations', action: 'write' },

  // Messages
  'GET /conversations/:id/messages': { category: 'messages', action: 'read' },
  'POST /conversations/:id/messages': { category: 'messages', action: 'write' },

  // Agents
  'GET /agents': { category: 'agents', action: 'read' },
  'GET /agents/:id': { category: 'agents', action: 'read' },

  // Teams
  'GET /teams': { category: 'teams', action: 'read' },
  'POST /teams': { category: 'teams', action: 'write' },
  'GET /teams/:id': { category: 'teams', action: 'read' },
  'PATCH /teams/:id': { category: 'teams', action: 'write' },
  'DELETE /teams/:id': { category: 'teams', action: 'delete' },

  // Inboxes
  'GET /inboxes': { category: 'inboxes', action: 'read' },
  'GET /inboxes/:id': { category: 'inboxes', action: 'read' },
  'GET /inboxes/:id/agents': { category: 'inboxes', action: 'read' },

  // Specialists
  'GET /specialists': { category: 'specialists', action: 'read' },
  'POST /specialists': { category: 'specialists', action: 'write' },
  'GET /specialists/:id': { category: 'specialists', action: 'read' },
  'PATCH /specialists/:id': { category: 'specialists', action: 'write' },
  'DELETE /specialists/:id': { category: 'specialists', action: 'delete' },
  'GET /specialists/:id/availabilities': { category: 'specialists', action: 'read' },
  'PUT /specialists/:id/availabilities': { category: 'specialists', action: 'write' },
  'GET /specialists/:id/available_slots': { category: 'specialists', action: 'read' },

  // Appointments
  'GET /appointments': { category: 'appointments', action: 'read' },
  'POST /appointments': { category: 'appointments', action: 'write' },
  'GET /appointments/:id': { category: 'appointments', action: 'read' },
  'PATCH /appointments/:id': { category: 'appointments', action: 'write' },
  'DELETE /appointments/:id': { category: 'appointments', action: 'delete' },

  // Webhooks
  'GET /webhooks': { category: 'webhooks', action: 'read' },
  'POST /webhooks': { category: 'webhooks', action: 'write' },
  'PATCH /webhooks/:id': { category: 'webhooks', action: 'write' },
  'DELETE /webhooks/:id': { category: 'webhooks', action: 'delete' },

  // Automation
  'GET /automation_rules': { category: 'automation', action: 'read' },
  'POST /automation_rules': { category: 'automation', action: 'write' },
  'GET /automation_rules/:id': { category: 'automation', action: 'read' },
  'PATCH /automation_rules/:id': { category: 'automation', action: 'write' },
  'DELETE /automation_rules/:id': { category: 'automation', action: 'delete' },

  // Reports
  'GET /reports': { category: 'reports', action: 'read' },
  'GET /reports/summary': { category: 'reports', action: 'read' },

  // Labels
  'GET /labels': { category: 'labels', action: 'read' },
  'POST /labels': { category: 'labels', action: 'write' },

  // Canned Responses
  'GET /canned_responses': { category: 'canned_responses', action: 'read' },
  'POST /canned_responses': { category: 'canned_responses', action: 'write' },

  // Custom Attributes
  'GET /custom_attribute_definitions': { category: 'custom_attributes', action: 'read' },
  'POST /custom_attribute_definitions': { category: 'custom_attributes', action: 'write' },

  // Integrations
  'GET /integrations/apps': { category: 'integrations', action: 'read' },

  // Help Center (using integrations category)
  'GET /portals': { category: 'integrations', action: 'read' },
  'POST /portals': { category: 'integrations', action: 'write' },

  // CSAT
  'GET /csat_survey_responses': { category: 'csat', action: 'read' },
  'GET /csat_survey_responses/metrics': { category: 'csat', action: 'read' },
};

export class TokenService {
  async validateApiToken(token: string): Promise<TokenValidation> {
    if (!token) {
      return { valid: false, error: 'Missing API token' };
    }

    // Check legacy API key first (backward compatibility)
    if (LEGACY_API_KEY && token === LEGACY_API_KEY) {
      return {
        valid: true,
        isLegacy: true,
        permissions: this.getFullPermissions(),
        rateLimit: 100,
      };
    }

    // Validate against database
    const apiToken = await tokenRepository.validateToken(token);

    if (!apiToken) {
      return { valid: false, error: 'Invalid or expired API token' };
    }

    return {
      valid: true,
      tokenId: apiToken.id,
      userId: apiToken.user_id,
      permissions: apiToken.permissions as TokenPermissions,
      rateLimit: apiToken.rate_limit_per_minute,
    };
  }

  getPermissionForEndpoint(
    method: string,
    path: string
  ): { category: PermissionCategory; action: PermissionAction } | null {
    // Normalize path (replace IDs with :id)
    const normalizedPath = path
      .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id')
      .replace(/\/\d+/g, '/:id');

    const key = `${method.toUpperCase()} ${normalizedPath}`;

    // Direct match
    if (ENDPOINT_PERMISSION_MAP[key]) {
      return ENDPOINT_PERMISSION_MAP[key];
    }

    // Try without trailing :id for partial matches
    for (const [pattern, permission] of Object.entries(ENDPOINT_PERMISSION_MAP)) {
      const patternRegex = new RegExp(
        '^' + pattern.replace(/:id/g, '[^/]+').replace(/\//g, '\\/') + '$'
      );
      if (patternRegex.test(key)) {
        return permission;
      }
    }

    return null;
  }

  hasPermission(
    permissions: TokenPermissions,
    category: PermissionCategory,
    action: PermissionAction
  ): boolean {
    const categoryPermissions = permissions[category];
    if (!categoryPermissions) {
      return false;
    }
    return categoryPermissions[action] === true;
  }

  async createToken(
    userId: string,
    data: CreateTokenRequest
  ): Promise<CreateTokenResponse> {
    const result = await tokenRepository.create(userId, data);

    await auditRepository.create({
      user_id: userId,
      action: 'token.create',
      resource_type: 'api_token',
      resource_id: result.token.id,
      metadata: { name: data.name },
    });

    return {
      token: result.token,
      plain_token: result.plainToken,
    };
  }

  async getTokens(userId?: string): Promise<ApiTokenWithUser[]> {
    return tokenRepository.findAll(userId);
  }

  async getToken(id: string): Promise<ApiTokenWithUser | null> {
    return tokenRepository.findByIdWithUser(id);
  }

  async updateToken(
    id: string,
    data: UpdateTokenRequest,
    updatedBy: string
  ): Promise<ApiTokenPublic | null> {
    const result = await tokenRepository.update(id, data);

    if (result) {
      await auditRepository.create({
        user_id: updatedBy,
        action: 'token.update',
        resource_type: 'api_token',
        resource_id: id,
        metadata: data,
      });
    }

    return result;
  }

  async regenerateToken(
    id: string,
    regeneratedBy: string
  ): Promise<{ token: ApiTokenPublic; plain_token: string } | null> {
    const result = await tokenRepository.regenerate(id);

    if (result) {
      await auditRepository.create({
        user_id: regeneratedBy,
        action: 'token.regenerate',
        resource_type: 'api_token',
        resource_id: id,
      });

      return {
        token: result.token,
        plain_token: result.plainToken,
      };
    }

    return null;
  }

  async revokeToken(id: string, revokedBy: string): Promise<boolean> {
    const result = await tokenRepository.delete(id);

    if (result) {
      await auditRepository.create({
        user_id: revokedBy,
        action: 'token.revoke',
        resource_type: 'api_token',
        resource_id: id,
      });
    }

    return result;
  }

  async getStats(): Promise<{ total: number; active: number }> {
    const total = await tokenRepository.count(false);
    const active = await tokenRepository.count(true);
    return { total, active };
  }

  private getFullPermissions(): TokenPermissions {
    const categories: PermissionCategory[] = [
      'contacts', 'conversations', 'messages', 'agents', 'teams', 'inboxes',
      'specialists', 'appointments', 'webhooks', 'automation', 'reports',
      'labels', 'canned_responses', 'custom_attributes', 'integrations', 'csat',
    ];

    return categories.reduce((acc, category) => ({
      ...acc,
      [category]: { read: true, write: true, delete: true },
    }), {} as TokenPermissions);
  }
}

export const tokenService = new TokenService();
