import React, { useState, useEffect } from 'react';
import {
  X,
  Bot,
  Zap,
  Sliders,
  Sparkles,
  Search,
  Code2,
  FileJson,
  Play,
  Check,
  Plus,
  Trash2,
  Copy,
  HelpCircle,
  Loader2,
  Cpu,
} from 'lucide-react';
import { WorkflowNodeData, AgentPersona, AgentModel, AgentTool, InputSchemaField } from '../types';

interface NodeInspectorProps {
  selectedNode: { id: string; data: WorkflowNodeData } | null;
  agentPersonas: AgentPersona[];
  onUpdateNode: (nodeId: string, newData: Partial<WorkflowNodeData>) => void;
  onClose: () => void;
  onTestRunNode: (nodeId: string) => void;
  isTestingNode?: boolean;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  selectedNode,
  agentPersonas,
  onUpdateNode,
  onClose,
  onTestRunNode,
  isTestingNode = false,
}) => {
  if (!selectedNode) return null;

  const { id, data } = selectedNode;
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  const handlePersonaChange = (personaId: string) => {
    const persona = agentPersonas.find((p) => p.id === personaId);
    if (persona) {
      onUpdateNode(id, {
        agentId: persona.id,
        agentPersona: persona,
        model: persona.defaultModel,
        systemInstruction: persona.systemInstruction,
        temperature: persona.defaultTemperature,
        tools: [...persona.defaultTools],
      });
    }
  };

  const handleToolToggle = (tool: AgentTool) => {
    const currentTools = data.tools || [];
    const newTools = currentTools.includes(tool)
      ? currentTools.filter((t) => t !== tool)
      : [...currentTools, tool];
    onUpdateNode(id, { tools: newTools });
  };

  const handleCopyVarTag = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedVar(tag);
    setTimeout(() => setCopiedVar(null), 1500);
  };

  const insertTagToPrompt = (tag: string) => {
    const currentPrompt = data.contextPrompt || '';
    onUpdateNode(id, { contextPrompt: currentPrompt + ` ${tag} ` });
  };

  // For Trigger Node: Manage Input Schema
  const handleAddInputSchemaField = () => {
    const current = data.inputSchema || [];
    const newKey = `field_${current.length + 1}`;
    onUpdateNode(id, {
      inputSchema: [
        ...current,
        { key: newKey, label: `Biến ${current.length + 1}`, type: 'string', defaultValue: '' },
      ],
      triggerInputs: {
        ...(data.triggerInputs || {}),
        [newKey]: '',
      },
    });
  };

  const handleRemoveInputSchemaField = (index: number) => {
    const current = [...(data.inputSchema || [])];
    const removed = current.splice(index, 1)[0];
    const newTriggerInputs = { ...(data.triggerInputs || {}) };
    if (removed) delete newTriggerInputs[removed.key];
    onUpdateNode(id, {
      inputSchema: current,
      triggerInputs: newTriggerInputs,
    });
  };

  const handleUpdateInputSchemaField = (index: number, key: string, value: any) => {
    const current = [...(data.inputSchema || [])];
    if (current[index]) {
      current[index] = { ...current[index], [key]: value };
      onUpdateNode(id, { inputSchema: current });
    }
  };

  const handleUpdateTriggerInputValue = (key: string, val: string) => {
    onUpdateNode(id, {
      triggerInputs: {
        ...(data.triggerInputs || {}),
        [key]: val,
      },
    });
  };

  return (
    <div className="w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full shadow-2xl z-20">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 rounded-lg">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              Cấu hình Node AI
            </h3>
            <p className="text-[11px] text-slate-500 font-mono">ID: {id}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-slate-700 dark:text-slate-300">
        {/* Node Label */}
        <div>
          <label className="block font-semibold mb-1 text-slate-800 dark:text-slate-200">
            Tên hiển thị Node
          </label>
          <input
            type="text"
            value={data.label || ''}
            onChange={(e) => onUpdateNode(id, { label: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Nhập tên node..."
          />
        </div>

        {/* TRIGGER NODE SPECIFIC CONFIG */}
        {data.type === 'trigger' ? (
          <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-[11px]">
                Biến Đầu Vào Workflow (Inputs)
              </label>
              <button
                onClick={handleAddInputSchemaField}
                className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-1 rounded border border-indigo-200 dark:border-indigo-800"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm biến
              </button>
            </div>

            <p className="text-slate-500 text-[11px]">
              Định nghĩa danh sách tham số đầu vào mà người dùng sẽ cung cấp khi bắt đầu workflow.
            </p>

            <div className="space-y-3">
              {(data.inputSchema || []).map((field, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={field.key}
                      onChange={(e) => handleUpdateInputSchemaField(idx, 'key', e.target.value)}
                      placeholder="Mã biến (key)"
                      className="w-1/2 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-indigo-600 dark:text-indigo-400 font-semibold text-xs"
                    />
                    <select
                      value={field.type}
                      onChange={(e) => handleUpdateInputSchemaField(idx, 'type', e.target.value)}
                      className="w-1/2 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    >
                      <option value="string">Văn bản (String)</option>
                      <option value="code">Mã nguồn (Code)</option>
                      <option value="number">Số (Number)</option>
                    </select>
                    <button
                      onClick={() => handleRemoveInputSchemaField(idx)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Giá trị mặc định (Default Value)</label>
                    <textarea
                      rows={field.type === 'code' ? 3 : 2}
                      value={data.triggerInputs?.[field.key] ?? field.defaultValue ?? ''}
                      onChange={(e) => handleUpdateTriggerInputValue(field.key, e.target.value)}
                      className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-[11px]"
                      placeholder="Nhập giá trị mẫu để chạy thử..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* AGENT NODE CONFIG */
          <>
            {/* Agent Persona Selection */}
            <div>
              <label className="block font-semibold mb-1 text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-indigo-500" /> Chọn Agent Persona
              </label>
              <select
                value={data.agentId || ''}
                onChange={(e) => handlePersonaChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
              >
                <option value="">-- Tùy chỉnh Agent riêng --</option>
                {agentPersonas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.avatar} {p.name} ({p.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Model Selection */}
            <div>
              <label className="block font-semibold mb-1 text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-purple-500" /> Gemini AI Model
              </label>
              <select
                value={data.model}
                onChange={(e) => onUpdateNode(id, { model: e.target.value as AgentModel })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs focus:ring-2 focus:ring-purple-500"
              >
                <option value="gemini-3.6-flash">gemini-3.6-flash (Mặc định - Nhanh & Thông minh)</option>
                <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Lý luận & Code phức tạp)</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Siêu nhanh / Phân loại)</option>
                <option value="gemini-3.1-flash-image">gemini-3.1-flash-image (Tạo hình ảnh AI)</option>
              </select>
            </div>

            {/* System Instruction */}
            <div>
              <label className="block font-semibold mb-1 text-slate-800 dark:text-slate-200">
                System Instructions (Chỉ dẫn Vai trò)
              </label>
              <textarea
                rows={3}
                value={data.systemInstruction || ''}
                onChange={(e) => onUpdateNode(id, { systemInstruction: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                placeholder="Cấu hình persona, vai trò, nguyên tắc làm việc cho Agent..."
              />
            </div>

            {/* Helper Tag Inserter */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] block">
                📌 Thẻ Biến Tự Động (Variable Inserter)
              </span>
              <p className="text-[10px] text-slate-500">
                Bấm vào các thẻ bên dưới để chèn dữ liệu từ node trước vào Prompt:
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => insertTagToPrompt('{{input.topic}}')}
                  className="px-2 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded text-[10px] font-mono hover:bg-indigo-200"
                >
                  + {'{{input.topic}}'}
                </button>
                <button
                  type="button"
                  onClick={() => insertTagToPrompt('{{nodes.node_research.output}}')}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded text-[10px] font-mono hover:bg-blue-200"
                >
                  + {'{{nodes.node_research.output}}'}
                </button>
                <button
                  type="button"
                  onClick={() => insertTagToPrompt('{{global.companyName}}')}
                  className="px-2 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded text-[10px] font-mono hover:bg-emerald-200"
                >
                  + {'{{global.companyName}}'}
                </button>
              </div>
            </div>

            {/* Context Prompt Template */}
            <div>
              <label className="block font-semibold mb-1 text-slate-800 dark:text-slate-200">
                Context Prompt Template (Mẫu Yêu cầu Thực thi)
              </label>
              <textarea
                rows={5}
                value={data.contextPrompt || ''}
                onChange={(e) => onUpdateNode(id, { contextPrompt: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                placeholder="Nhập nội dung prompt kết hợp các biến {{input.xyz}} hoặc {{nodes.xyz.output}}..."
              />
            </div>

            {/* Model Hyperparameters */}
            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="font-semibold text-slate-800 dark:text-slate-200 block">
                Tham số Model (Hyperparameters)
              </label>

              {/* Temperature */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span>Temperature (Nhiệt độ sáng tạo):</span>
                  <span className="font-mono font-bold text-indigo-600">{data.temperature ?? 0.7}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={data.temperature ?? 0.7}
                  onChange={(e) => onUpdateNode(id, { temperature: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>

            {/* Tools Capabilities */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="font-semibold text-slate-800 dark:text-slate-200 block">
                Công cụ Đính kèm (Agent Tools)
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <input
                  type="checkbox"
                  checked={(data.tools || []).includes('googleSearch')}
                  onChange={() => handleToolToggle('googleSearch')}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <Search className="w-4 h-4 text-blue-500" />
                <div>
                  <span className="font-semibold block text-slate-800 dark:text-slate-200">Google Search Grounding</span>
                  <span className="text-[10px] text-slate-500">Tra cứu dữ liệu thực tế trên Web thời gian thực</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <input
                  type="checkbox"
                  checked={(data.tools || []).includes('codeExecution')}
                  onChange={() => handleToolToggle('codeExecution')}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <Code2 className="w-4 h-4 text-purple-500" />
                <div>
                  <span className="font-semibold block text-slate-800 dark:text-slate-200">Python Code Execution</span>
                  <span className="text-[10px] text-slate-500">Cho phép Agent viết và chạy mã Python</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <input
                  type="checkbox"
                  checked={(data.tools || []).includes('jsonOutput')}
                  onChange={() => handleToolToggle('jsonOutput')}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <FileJson className="w-4 h-4 text-amber-500" />
                <div>
                  <span className="font-semibold block text-slate-800 dark:text-slate-200">Bắt buộc JSON Response</span>
                  <span className="text-[10px] text-slate-500">Đảm bảo kết quả trả về cấu trúc JSON chuẩn</span>
                </div>
              </label>
            </div>
          </>
        )}
      </div>

      {/* Drawer Footer / Single Node Test Action */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <button
          onClick={() => onTestRunNode(id)}
          disabled={isTestingNode}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {isTestingNode ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Đang chạy thử Node...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" /> Chạy thử riêng Node này
            </>
          )}
        </button>
      </div>
    </div>
  );
};
