import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { ApiToken, TokenPermissions } from '../types';
import { PERMISSION_CATEGORIES } from '../types';

export default function TokensPage() {
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [editingToken, setEditingToken] = useState<ApiToken | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formAccountId, setFormAccountId] = useState('');
  const [formRateLimit, setFormRateLimit] = useState(100);
  const [formPermissions, setFormPermissions] = useState<TokenPermissions>({});

  useEffect(() => {
    loadTokens();
  }, []);

  const loadTokens = async () => {
    try {
      const { data } = await api.getTokens();
      setTokens(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load tokens');
    } finally {
      setIsLoading(false);
    }
  };

  const initFullPermissions = () => {
    const perms: TokenPermissions = {};
    PERMISSION_CATEGORIES.forEach(cat => {
      perms[cat] = { read: true, write: true, delete: true };
    });
    return perms;
  };

  const initReadOnlyPermissions = () => {
    const perms: TokenPermissions = {};
    PERMISSION_CATEGORIES.forEach(cat => {
      perms[cat] = { read: true, write: false, delete: false };
    });
    return perms;
  };

  const openCreateModal = () => {
    setEditingToken(null);
    setFormName('');
    setFormAccountId('');
    setFormRateLimit(100);
    setFormPermissions(initFullPermissions());
    setNewToken(null);
    setShowModal(true);
  };

  const openEditModal = (token: ApiToken) => {
    setEditingToken(token);
    setFormName(token.name);
    setFormAccountId(token.chatwoot_account_id || '');
    setFormRateLimit(token.rate_limit_per_minute);
    setFormPermissions(token.permissions);
    setNewToken(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingToken) {
        await api.updateToken(editingToken.id, {
          name: formName,
          chatwoot_account_id: formAccountId || null,
          rate_limit_per_minute: formRateLimit,
          permissions: formPermissions,
        });
      } else {
        const result = await api.createToken({
          name: formName,
          chatwoot_account_id: formAccountId || null,
          rate_limit_per_minute: formRateLimit,
          permissions: formPermissions,
        });
        setNewToken(result.plain_token);
      }
      loadTokens();
      if (editingToken) setShowModal(false);
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (token: ApiToken) => {
    if (!confirm(`Revoke token "${token.name}"?`)) return;
    try {
      await api.deleteToken(token.id);
      loadTokens();
    } catch (err: any) {
      setError(err.message || 'Failed to revoke token');
    }
  };

  const handleRegenerate = async (token: ApiToken) => {
    if (!confirm(`Regenerate token "${token.name}"? The old token will stop working.`)) return;
    try {
      const result = await api.regenerateToken(token.id);
      setNewToken(result.plain_token);
      setEditingToken(token);
      setShowModal(true);
      loadTokens();
    } catch (err: any) {
      setError(err.message || 'Failed to regenerate token');
    }
  };

  const togglePermission = (category: string, action: 'read' | 'write' | 'delete') => {
    setFormPermissions(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [action]: !prev[category]?.[action],
      },
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-display font-bold text-slate-800">API Tokens</h1>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-brand text-dark font-semibold rounded-lg hover:bg-brand-light transition-colors"
        >
          Create Token
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Tokens Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Prefix</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Used</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {tokens.map((token) => (
              <tr key={token.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-800">{token.name}</div>
                  <div className="text-xs text-slate-500">{token.user_email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <code className="text-sm bg-slate-100 px-2 py-1 rounded font-mono">{token.token_prefix}...</code>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                    token.is_active ? 'bg-brand/10 text-brand-dark' : 'bg-red-100 text-red-700'
                  }`}>
                    {token.is_active ? 'Active' : 'Revoked'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {token.last_used_at ? new Date(token.last_used_at).toLocaleDateString() : 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {new Date(token.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => openEditModal(token)}
                    className="text-primary-600 hover:text-primary-800 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleRegenerate(token)}
                    className="text-amber-600 hover:text-amber-800 transition-colors"
                  >
                    Regenerate
                  </button>
                  <button
                    onClick={() => handleDelete(token)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    Revoke
                  </button>
                </td>
              </tr>
            ))}
            {tokens.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  No tokens yet. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-display font-semibold text-slate-800">
                {newToken ? 'Token Created!' : editingToken ? 'Edit Token' : 'Create Token'}
              </h2>
            </div>

            {newToken ? (
              <div className="p-6">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <p className="text-amber-800 font-semibold mb-2">
                    Save this token now! It won't be shown again.
                  </p>
                  <code className="block bg-dark text-brand p-3 rounded-lg text-sm break-all font-mono">
                    {newToken}
                  </code>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(newToken);
                    alert('Token copied to clipboard!');
                  }}
                  className="px-4 py-2 bg-brand text-dark font-semibold rounded-lg mr-2 hover:bg-brand-light transition-colors"
                >
                  Copy to Clipboard
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Token Name</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-colors"
                      placeholder="e.g., Production N8N"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Chatwoot Account ID (optional)
                    </label>
                    <input
                      type="text"
                      value={formAccountId}
                      onChange={(e) => setFormAccountId(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-colors"
                      placeholder="Leave empty for default"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Rate Limit (requests/minute)
                    </label>
                    <input
                      type="number"
                      value={formRateLimit}
                      onChange={(e) => setFormRateLimit(parseInt(e.target.value))}
                      className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-colors"
                      min={1}
                      max={1000}
                    />
                  </div>

                  {/* Permissions */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-slate-700">Permissions</label>
                      <div className="space-x-2">
                        <button
                          type="button"
                          onClick={() => setFormPermissions(initFullPermissions())}
                          className="text-xs px-2.5 py-1 bg-brand/10 text-brand-dark rounded-full font-medium hover:bg-brand/20 transition-colors"
                        >
                          Full Access
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormPermissions(initReadOnlyPermissions())}
                          className="text-xs px-2.5 py-1 bg-primary-100 text-primary-700 rounded-full font-medium hover:bg-primary-200 transition-colors"
                        >
                          Read Only
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormPermissions({})}
                          className="text-xs px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full font-medium hover:bg-slate-200 transition-colors"
                        >
                          None
                        </button>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                            <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Read</th>
                            <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Write</th>
                            <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Delete</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {PERMISSION_CATEGORIES.map((category) => (
                            <tr key={category} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-2.5 text-sm capitalize text-slate-700">{category.replace('_', ' ')}</td>
                              {(['read', 'write', 'delete'] as const).map((action) => (
                                <td key={action} className="px-4 py-2.5 text-center">
                                  <input
                                    type="checkbox"
                                    checked={formPermissions[category]?.[action] || false}
                                    onChange={() => togglePermission(category, action)}
                                    className="h-4 w-4 text-brand rounded border-slate-300 focus:ring-brand"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-brand text-dark font-semibold rounded-lg hover:bg-brand-light transition-colors"
                  >
                    {editingToken ? 'Save Changes' : 'Create Token'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
