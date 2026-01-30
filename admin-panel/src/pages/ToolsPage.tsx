import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { ToolWithInstruction } from '../types';

export default function ToolsPage() {
  const [tools, setTools] = useState<ToolWithInstruction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingTool, setEditingTool] = useState<ToolWithInstruction | null>(null);
  const [formDescription, setFormDescription] = useState('');
  const [formEnabled, setFormEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedTool, setExpandedTool] = useState<string | null>(null);

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    try {
      const { data } = await api.getTools();
      setTools(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load tools');
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (tool: ToolWithInstruction) => {
    setEditingTool(tool);
    setFormDescription(tool.custom_description || '');
    setFormEnabled(tool.is_enabled);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTool) return;

    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      await api.updateTool(editingTool.name, {
        custom_description: formDescription || null,
        is_enabled: formEnabled,
      });
      setSuccess(`Tool "${editingTool.name}" updated successfully`);
      loadTools();
      setEditingTool(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update tool');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async (tool: ToolWithInstruction) => {
    if (!confirm(`Reset "${tool.name}" to default instruction? This will remove any custom description.`)) return;

    setError('');
    setSuccess('');

    try {
      await api.resetTool(tool.name);
      setSuccess(`Tool "${tool.name}" reset to default`);
      loadTools();
    } catch (err: any) {
      setError(err.message || 'Failed to reset tool');
    }
  };

  const toggleToolEnabled = async (tool: ToolWithInstruction) => {
    setError('');
    setSuccess('');

    try {
      await api.updateTool(tool.name, {
        is_enabled: !tool.is_enabled,
      });
      setSuccess(`Tool "${tool.name}" ${!tool.is_enabled ? 'enabled' : 'disabled'}`);
      loadTools();
    } catch (err: any) {
      setError(err.message || 'Failed to update tool');
    }
  };

  const toggleExpand = (toolName: string) => {
    setExpandedTool(expandedTool === toolName ? null : toolName);
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
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-slate-800">MCP Tools</h1>
        <p className="text-slate-600 mt-1">
          Customize tool instructions to control how the AI Agent uses each tool.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      {/* Tools List */}
      <div className="space-y-4">
        {tools.map((tool) => (
          <div
            key={tool.name}
            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">
                    {tool.is_enabled ? (
                      <span title="Tool enabled">&#128295;</span>
                    ) : (
                      <span title="Tool disabled" className="opacity-40">&#128295;</span>
                    )}
                  </span>
                  <div>
                    <h3 className="font-semibold text-slate-800 font-mono">{tool.name}</h3>
                    {tool.has_custom_instruction && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand/10 text-brand-dark mt-1">
                        Custom Instruction
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleToolEnabled(tool)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 ${
                      tool.is_enabled ? 'bg-brand' : 'bg-slate-200'
                    }`}
                    title={tool.is_enabled ? 'Click to disable' : 'Click to enable'}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        tool.is_enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-sm text-slate-600 line-clamp-2">
                  {tool.description}
                </p>
              </div>

              <div className="mt-3 flex items-center space-x-3">
                <button
                  onClick={() => toggleExpand(tool.name)}
                  className="text-sm text-primary-600 hover:text-primary-800 transition-colors"
                >
                  {expandedTool === tool.name ? 'Hide Details' : 'Show Details'}
                </button>
                <button
                  onClick={() => openEditModal(tool)}
                  className="text-sm text-primary-600 hover:text-primary-800 transition-colors"
                >
                  Edit Instruction
                </button>
                {tool.has_custom_instruction && (
                  <button
                    onClick={() => handleReset(tool)}
                    className="text-sm text-amber-600 hover:text-amber-800 transition-colors"
                  >
                    Reset to Default
                  </button>
                )}
              </div>
            </div>

            {/* Expanded Details */}
            {expandedTool === tool.name && (
              <div className="border-t border-slate-200 bg-slate-50 p-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-1">Default Instruction:</h4>
                    <pre className="text-sm text-slate-600 bg-white p-3 rounded-lg border border-slate-200 whitespace-pre-wrap font-mono">
                      {tool.default_description}
                    </pre>
                  </div>

                  {tool.custom_description && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-1">Custom Instruction:</h4>
                      <pre className="text-sm text-slate-600 bg-brand/5 p-3 rounded-lg border border-brand/20 whitespace-pre-wrap font-mono">
                        {tool.custom_description}
                      </pre>
                    </div>
                  )}

                  {tool.inputSchema && Object.keys(tool.inputSchema).length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-1">Input Schema:</h4>
                      <pre className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200 overflow-x-auto font-mono">
                        {JSON.stringify(tool.inputSchema, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {tools.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
            No tools available.
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingTool && (
        <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-display font-semibold text-slate-800">
                Edit Tool: <span className="font-mono">{editingTool.name}</span>
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Default Instruction (read-only)
                  </label>
                  <pre className="text-sm text-slate-600 bg-slate-100 p-3 rounded-lg border border-slate-200 whitespace-pre-wrap font-mono">
                    {editingTool.default_description}
                  </pre>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Custom Instruction
                  </label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={8}
                    className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-colors font-mono text-sm"
                    placeholder="Enter custom instruction for this tool... Leave empty to use the default instruction."
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    This instruction will be shown to the AI Agent instead of the default.
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setFormEnabled(!formEnabled)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 ${
                      formEnabled ? 'bg-brand' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        formEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-slate-700">
                    {formEnabled ? 'Tool Enabled' : 'Tool Disabled'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Disabled tools will not appear in the tools list sent to AI Agents.
                </p>
              </div>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingTool(null)}
                  className="px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2.5 bg-brand text-dark font-semibold rounded-lg hover:bg-brand-light transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
