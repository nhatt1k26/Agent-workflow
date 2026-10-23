import React, { useState } from 'react';
import { Globe, Plus, Trash2, Code2, Copy, Check, Terminal, Sparkles } from 'lucide-react';

interface GlobalVariablesManagerProps {
  globalVariables: Record<string, string>;
  onUpdateGlobalVariables: (vars: Record<string, string>) => void;
  workflowId: string;
}

export const GlobalVariablesManager: React.FC<GlobalVariablesManagerProps> = ({
  globalVariables,
  onUpdateGlobalVariables,
  workflowId,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const handleAddVariable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;
    onUpdateGlobalVariables({
      ...globalVariables,
      [newKey.trim()]: newValue,
    });
    setNewKey('');
    setNewValue('');
  };

  const handleRemoveVariable = (key: string) => {
    const updated = { ...globalVariables };
    delete updated[key];
    onUpdateGlobalVariables(updated);
  };

  const handleValueChange = (key: string, value: string) => {
    onUpdateGlobalVariables({
      ...globalVariables,
      [key]: value,
    });
  };

  const curlCodeSnippet = `curl -X POST "${window.location.origin}/api/workflow/run-node" \\
  -H "Content-Type: application/json" \\
  -d '{
    "nodeId": "node_research",
    "model": "gemini-3.6-flash",
    "systemInstruction": "Bạn là Chuyên viên AI nghiên cứu web",
    "contextPrompt": "Tìm kiếm xu hướng AI Agent 2026 cho thương hiệu {{global.companyName}}",
    "globals": ${JSON.stringify(globalVariables, null, 2)}
  }'`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(curlCodeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold">Biến Toàn Cục & Tích Hợp Webhook / REST API</h2>
          </div>
          <p className="text-sm text-slate-300">
            Quản lý các biến môi trường dùng chung cho toàn bộ Agent node (truy cập qua <code className="font-mono text-amber-300">{'{{global.ten_bien}}'}</code>) và mã gọi API.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Global Variables Key-Value Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" /> Biến Toàn Cục (Global Variables)
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {Object.keys(globalVariables).length} biến
            </span>
          </div>

          {/* Add New Variable Form */}
          <form onSubmit={handleAddVariable} className="flex gap-2 text-xs">
            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="Tên biến (VD: brandTone)"
              className="w-1/3 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
            />
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Giá trị (VD: Chuyên nghiệp, truyền cảm hứng)"
              className="w-2/3 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold flex items-center gap-1 shrink-0"
            >
              <Plus className="w-4 h-4" /> Thêm
            </button>
          </form>

          {/* Variables List */}
          <div className="space-y-2 pt-2">
            {Object.keys(globalVariables).length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs italic">
                Chưa có biến toàn cục nào được định nghĩa.
              </div>
            ) : (
              Object.entries(globalVariables).map(([key, value]) => (
                <div
                  key={key}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="w-1/3">
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 block truncate">
                      {`{{global.${key}}}`}
                    </span>
                  </div>
                  <div className="w-7/12">
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleValueChange(key, e.target.value)}
                      className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveVariable(key)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* REST API / Webhook Integration Snippet */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" /> Gọi Workflow qua REST API / cURL
            </h3>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedCode ? 'Đã sao chép!' : 'Sao chép cURL'}
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Bạn có thể tích hợp trực tiếp endpoint backend của hệ thống với ứng dụng bên ngoài (N8N, Zapier, Webhook Server) để thực thi tự động.
          </p>

          <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto leading-relaxed">
            {curlCodeSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
};
