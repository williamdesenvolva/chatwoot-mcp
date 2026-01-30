export declare const PERMISSION_CATEGORIES: readonly ["contacts", "conversations", "messages", "agents", "teams", "inboxes", "specialists", "appointments", "webhooks", "automation", "reports", "labels", "canned_responses", "custom_attributes", "integrations", "csat"];
export type PermissionCategory = typeof PERMISSION_CATEGORIES[number];
export type PermissionAction = 'read' | 'write' | 'delete';
export interface CategoryPermission {
    read: boolean;
    write: boolean;
    delete: boolean;
}
export type TokenPermissions = {
    [K in PermissionCategory]?: CategoryPermission;
};
export interface User {
    id: string;
    email: string;
    password_hash: string;
    name: string | null;
    role: 'superadmin' | 'admin';
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}
export interface UserPublic {
    id: string;
    email: string;
    name: string | null;
    role: 'superadmin' | 'admin';
    is_active: boolean;
    created_at: Date;
}
export interface Session {
    id: string;
    user_id: string;
    token: string;
    expires_at: Date;
    ip_address: string | null;
    user_agent: string | null;
    created_at: Date;
}
export interface ApiToken {
    id: string;
    user_id: string;
    name: string;
    token_hash: string;
    token_prefix: string;
    chatwoot_account_id: string | null;
    permissions: TokenPermissions;
    rate_limit_per_minute: number;
    is_active: boolean;
    last_used_at: Date | null;
    expires_at: Date | null;
    created_at: Date;
    updated_at: Date;
}
export interface ApiTokenPublic {
    id: string;
    user_id: string;
    name: string;
    token_prefix: string;
    chatwoot_account_id: string | null;
    permissions: TokenPermissions;
    rate_limit_per_minute: number;
    is_active: boolean;
    last_used_at: Date | null;
    expires_at: Date | null;
    created_at: Date;
}
export interface ApiTokenWithUser extends ApiTokenPublic {
    user_email: string;
    user_name: string | null;
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
    created_at: Date;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface LoginResponse {
    token: string;
    user: UserPublic;
    expires_at: string;
}
export interface CreateUserRequest {
    email: string;
    password: string;
    name?: string;
    role?: 'admin' | 'superadmin';
}
export interface UpdateUserRequest {
    email?: string;
    password?: string;
    name?: string;
    role?: 'admin' | 'superadmin';
    is_active?: boolean;
}
export interface CreateTokenRequest {
    name: string;
    chatwoot_account_id?: string;
    permissions: TokenPermissions;
    rate_limit_per_minute?: number;
    expires_at?: string;
}
export interface CreateTokenResponse {
    token: ApiTokenPublic;
    plain_token: string;
}
export interface UpdateTokenRequest {
    name?: string;
    chatwoot_account_id?: string;
    permissions?: TokenPermissions;
    rate_limit_per_minute?: number;
    is_active?: boolean;
    expires_at?: string | null;
}
export interface AuditLogQuery {
    page?: number;
    limit?: number;
    action?: string;
    api_token_id?: string;
    user_id?: string;
    from_date?: string;
    to_date?: string;
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    };
}
export interface DashboardStats {
    total_tokens: number;
    active_tokens: number;
    total_users: number;
    api_calls_today: number;
    api_calls_week: number;
    recent_logs: AuditLog[];
}
export interface TokenValidation {
    valid: boolean;
    error?: string;
    tokenId?: string;
    userId?: string;
    permissions?: TokenPermissions;
    isLegacy?: boolean;
    rateLimit?: number;
    accountId?: number;
    assistantId?: number;
}
export declare const FULL_PERMISSIONS: TokenPermissions;
export declare const READ_ONLY_PERMISSIONS: TokenPermissions;
export declare const NO_PERMISSIONS: TokenPermissions;
export interface ToolInstruction {
    id: string;
    tool_name: string;
    custom_description: string | null;
    is_enabled: boolean;
    created_by: string | null;
    updated_by: string | null;
    created_at: Date;
    updated_at: Date;
}
export interface ToolInstructionPublic {
    id: string;
    tool_name: string;
    custom_description: string | null;
    is_enabled: boolean;
    created_at: Date;
    updated_at: Date;
}
export interface UpsertToolInstructionRequest {
    custom_description?: string | null;
    is_enabled?: boolean;
}
export interface ToolWithInstruction {
    name: string;
    description: string;
    default_description: string;
    custom_description: string | null;
    is_enabled: boolean;
    has_custom_instruction: boolean;
    inputSchema?: Record<string, any>;
}
//# sourceMappingURL=index.d.ts.map