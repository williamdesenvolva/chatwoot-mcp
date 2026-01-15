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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">API Tokens</h1>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create Token
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Tokens Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prefix</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Used</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tokens.map((token) => (
              <tr key={token.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{token.name}</div>
                  <div className="text-xs text-gray-500">{token.user_email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">{token.token_prefix}...</code>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded ${
                    token.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {token.is_active ? 'Active' : 'Revoked'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {token.last_used_at ? new Date(token.last_used_at).toLocaleDateString() : 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(token.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => openEditModal(token)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleRegenerate(token)}
                    className="text-yellow-600 hover:text-yellow-900 mr-3"
                  >
                    Regenerate
                  </button>
                  <button
                    onClick={() => handleDelete(token)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Revoke
                  </button>
                </td>
              </tr>
            ))}
            {tokens.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No tokens yet. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">
                {newToken ? 'Token Created!' : editingToken ? 'Edit Token' : 'Create Token'}
              </h2>
            </div>

            {newToken ? (
              <div className="p-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
                  <p className="text-yellow-800 font-semibold mb-2">
                    Save this token now! It won't be shown again.
                  </p>
                  <code className="block bg-gray-900 text-green-400 p-3 rounded text-sm break-all">
                    {newToken}
                  </code>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(newToken);
                    alert('Token copied to clipboard!');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded mr-2"
                >
                  Copy to Clipboard
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Token Name</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="e.g., Production N8N"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Chatwoot Account ID (optional)
                    </label>
                    <input
                      type="text"
                      value={formAccountId}
                      onChange={(e) => setFormAccountId(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Leave empty for default"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Rate Limit (requests/minute)
                    </label>
                    <input
                      type="number"
                      value={formRateLimit}
                      onChange={(e) => setFormRateLimit(parseInt(e.target.value))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      min={1}
                      max={1000}
                    />
                  </div>

                  {/* Permissions */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">Permissions</label>
                      <div className="space-x-2">
                        <button
                          type="button"
                          onClick={() => setFormPermissions(initFullPermissions())}
                          className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded"
                        >
                          Full Access
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormPermissions(initReadOnlyPermissions())}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded"
                        >
                          Read Only
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormPermissions({})}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                        >
                          None
                        </button>
                      </div>
                    </div>

                    <div className="border rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Category</th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Read</th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Write</th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Delete</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {PERMISSION_CATEGORIES.map((category) => (
                            <tr key={category}>
                              <td className="px-4 py-2 text-sm capitalize">{category.replace('_', ' ')}</td>
                              {(['read', 'write', 'delete'] as const).map((action) => (
                                <td key={action} className="px-4 py-2 text-center">
                                  <input
                                    type="checkbox"
                                    checked={formPermissions[category]?.[action] || false}
                                    onChange={() => togglePermission(category, action)}
                                    className="h-4 w-4 text-blue-600 rounded"
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
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
