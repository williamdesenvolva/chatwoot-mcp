const API_BASE = '/admin';

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('admin_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('admin_token');
    window.location.href = '/admin/login';
    throw new Error('Unauthorized');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: any; expires_at: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    request<{ success: boolean }>('/auth/logout', { method: 'POST' }),

  getMe: () => request<{ user: any }>('/auth/me'),

  // Users
  getUsers: () => request<{ data: any[] }>('/users'),

  createUser: (data: any) =>
    request<{ data: any }>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateUser: (id: string, data: any) =>
    request<{ data: any }>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteUser: (id: string) =>
    request<{ success: boolean }>(`/users/${id}`, { method: 'DELETE' }),

  // Tokens
  getTokens: () => request<{ data: any[] }>('/tokens'),

  createToken: (data: any) =>
    request<{ token: any; plain_token: string }>('/tokens', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getToken: (id: string) => request<{ data: any }>(`/tokens/${id}`),

  updateToken: (id: string, data: any) =>
    request<{ data: any }>(`/tokens/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteToken: (id: string) =>
    request<{ success: boolean }>(`/tokens/${id}`, { method: 'DELETE' }),

  regenerateToken: (id: string) =>
    request<{ token: any; plain_token: string }>(`/tokens/${id}/regenerate`, {
      method: 'POST',
    }),

  // Audit
  getAuditLogs: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<{ data: any[]; pagination: any }>(`/audit${query}`);
  },

  // Stats
  getStats: () => request<any>('/stats'),

  // Tools
  getTools: () => request<{ data: any[] }>('/tools'),

  getTool: (name: string) => request<{ data: any }>(`/tools/${encodeURIComponent(name)}`),

  updateTool: (name: string, data: { custom_description?: string | null; is_enabled?: boolean }) =>
    request<{ data: any }>(`/tools/${encodeURIComponent(name)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  resetTool: (name: string) =>
    request<{ success: boolean }>(`/tools/${encodeURIComponent(name)}`, { method: 'DELETE' }),
};
