export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'superadmin' | 'admin';
  is_active: boolean;
  created_at: string;
}

export interface CategoryPermission {
  read: boolean;
  write: boolean;
  delete: boolean;
}

export type TokenPermissions = {
  [key: string]: CategoryPermission;
};

export interface ApiToken {
  id: string;
  user_id: string;
  name: string;
  token_prefix: string;
  chatwoot_account_id: string | null;
  permissions: TokenPermissions;
  rate_limit_per_minute: number;
  is_active: boolean;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
  user_email?: string;
  user_name?: string | null;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  api_token_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  request_method: string | null;
  request_path: string | null;
  response_status: number | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface DashboardStats {
  total_tokens: number;
  active_tokens: number;
  total_users: number;
  api_calls_today: number;
  api_calls_week: number;
  recent_logs: AuditLog[];
}

export interface LoginResponse {
  token: string;
  user: User;
  expires_at: string;
}

export interface CreateTokenResponse {
  token: ApiToken;
  plain_token: string;
}

export const PERMISSION_CATEGORIES = [
  'contacts',
  'conversations',
  'messages',
  'agents',
  'teams',
  'inboxes',
  'specialists',
  'appointments',
  'webhooks',
  'automation',
  'reports',
  'labels',
  'canned_responses',
  'custom_attributes',
  'integrations',
  'csat',
] as const;
