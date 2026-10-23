import React, { useState } from 'react';
import { Bot, Plus, Trash2, Edit3, Cpu, Search, Code2, Sparkles, Check } from 'lucide-react';
import { AgentPersona, AgentModel, AgentTool } from '../types';

interface AgentPersonasManagerProps {
  personas: AgentPersona[];
  onAddPersona: (persona: AgentPersona) => void;
  onUpdatePersona: (persona: AgentPersona) => void;
  onDeletePersona: (id: string) => void;
}

export const AgentPersonasManager: React.FC<AgentPersonasManagerProps> = ({
  personas,
  onAddPersona,
  onUpdatePersona,
  onDeletePersona,
}) => {
  const [editingPersona, setEditingPersona] = useState<AgentPersona | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState<Partial<AgentPersona>>({
    name: '',
    role: '',
    avatar: '🤖',
    description: '',
    systemInstruction: '',
    defaultModel: 'gemini-3.6-flash',
    defaultTemperature: 0.7,
    defaultTools: [],
  });

  const handleOpenCreate = () => {
    setFormData({
      name: 'Agent Persona Mới',
      role: 'Chuyên viên Tư vấn & Phân tích AI',
      avatar: '✨',
      color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-400',
      description: 'Mô tả nhiệm vụ chuyên biệt của Agent persona...',
      systemInstruction: 'Bạn là Chuyên viên AI cao cấp với tư duy phản biện sắc bén...',
      defaultModel: 'gemini-3.6-flash',
      defaultTemperature: 0.7,
      defaultTools: [],
    });
    setEditingPersona(null);
    setIsCreating(true);
  };

  const handleOpenEdit = (persona: AgentPersona) => {
    setFormData({ ...persona });
    setEditingPersona(persona);
    setIsCreating(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.systemInstruction) return;

    if (editingPersona) {
      onUpdatePersona({ ...editingPersona, ...formData } as AgentPersona);
    } else {
      const newPersona: AgentPersona = {
        id: `agent_custom_${Date.now()}`,
        name: formData.name || 'Custom Agent',
        role: formData.role || 'AI Assistant',
        avatar: formData.avatar || '🤖',
        color: formData.color || 'bg-blue-500/10 text-blue-600 border-blue-200',
        description: formData.description || '',
        systemInstruction: formData.systemInstruction || '',
        defaultModel: formData.defaultModel || 'gemini-3.6-flash',
        defaultTemperature: formData.defaultTemperature ?? 0.7,
        defaultTools: formData.defaultTools || [],
      };
      onAddPersona(newPersona);
    }
    setIsCreating(false);
    setEditingPersona(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold">Thư viện AI Agent Personas</h2>
          </div>
          <p className="text-sm text-slate-300">
            Quản lý và tái sử dụng các vai trò AI Agent với System Instructions, Gemini Model và công cụ được cấu hình sẵn.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg flex items-center gap-2 self-start md:self-auto transition-all"
        >
          <Plus className="w-5 h-5" /> Tạo Agent Persona Mới
        </button>
      </div>

      {/* Grid of Personas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {personas.map((persona) => (
          <div
            key={persona.id}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="text-3xl p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800">
                    {persona.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                      {persona.name}
                    </h3>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                      {persona.role}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(persona)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeletePersona(persona.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                {persona.description}
              </p>

              {/* System Instruction snippet */}
              <div className="bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400 line-clamp-3">
                {persona.systemInstruction}
              </div>
            </div>

            {/* Bottom Config Tags */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                {persona.defaultModel}
              </span>

              <div className="flex items-center gap-1.5 text-slate-400">
                {persona.defaultTools.includes('googleSearch') && <Search className="w-3.5 h-3.5 text-blue-500" />}
                {persona.defaultTools.includes('codeExecution') && <Code2 className="w-3.5 h-3.5 text-purple-500" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form for Create/Edit Persona */}
      {isCreating && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                {editingPersona ? 'Chỉnh sửa AI Agent Persona' : 'Tạo AI Agent Persona Mới'}
              </h3>
              <button
                onClick={() => setIsCreating(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block font-semibold mb-1">Avatar / Emoji</label>
                  <input
                    type="text"
                    value={formData.avatar || '🤖'}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    className="w-full text-center text-xl p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold mb-1">Tên Agent</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    placeholder="VD: Content Strategist..."
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Vai trò / Chức danh (Role)</label>
                <input
                  type="text"
                  value={formData.role || ''}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  placeholder="VD: Chuyên viên Biên tập Nội dung Cao cấp"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Mô tả nhiệm vụ</label>
                <input
                  type="text"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  placeholder="Mô tả ngắn gọn mục đích của Agent..."
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Gemini AI Model Mặc định</label>
                <select
                  value={formData.defaultModel || 'gemini-3.6-flash'}
                  onChange={(e) => setFormData({ ...formData, defaultModel: e.target.value as AgentModel })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                >
                  <option value="gemini-3.6-flash">gemini-3.6-flash (Mặc định)</option>
                  <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Lý luận sâu)</option>
                  <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Siêu nhanh)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">System Instructions (Chỉ dẫn Vai trò Core)</label>
                <textarea
                  rows={4}
                  value={formData.systemInstruction || ''}
                  onChange={(e) => setFormData({ ...formData, systemInstruction: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  placeholder="Nhập nguyên tắc ứng xử, chuyên môn và định dạng trả về cho Agent..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold shadow-md"
                >
                  Lưu Agent Persona
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
