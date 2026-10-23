import React, { useState } from 'react';
import { Play, X, Loader2, CheckCircle2, XCircle, Sparkles, Copy, Check, Download, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Workflow, WorkflowNodeData, NodeExecutionResult } from '../types';

interface WorkflowRunnerModalProps {
  workflow: Workflow;
  onClose: () => void;
  onExecuteWorkflow: (inputs: Record<string, string>) => Promise<void>;
  isRunning: boolean;
  nodeOutputs: Record<string, NodeExecutionResult>;
  activeNodeId: string | null;
  errorNodeId: string | null;
  logsHistory: any[];
}

export const WorkflowRunnerModal: React.FC<WorkflowRunnerModalProps> = ({
  workflow,
  onClose,
  onExecuteWorkflow,
  isRunning,
  nodeOutputs,
  activeNodeId,
  errorNodeId,
}) => {
  const triggerNode = workflow.nodes.find((n) => n.data.type === 'trigger');
  const inputSchema = triggerNode?.data.inputSchema || [];

  const [inputs, setInputs] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = { ...(triggerNode?.data.triggerInputs || {}) };
    inputSchema.forEach((field: any) => {
      if (!(field.key in initial)) {
        initial[field.key] = field.defaultValue || '';
      }
    });
    return initial;
  });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleInputChange = (key: string, val: string) => {
    setInputs((prev) => ({ ...prev, [key]: val }));
  };

  const handleStartRun = async () => {
    try {
      await onExecuteWorkflow(inputs);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.error('Run failed:', e);
    }
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleDownloadMarkdown = (filename: string, content: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${filename}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const outputNodes = workflow.nodes.filter((n) => n.data.type !== 'trigger');

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md">
              <Play className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                Thực Thi Workflow AI Agent
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {workflow.name} ({workflow.nodes.length} nodes)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700 dark:text-slate-300">
          {/* Inputs Section */}
          <div className="bg-indigo-50/50 dark:bg-indigo-950/30 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-700 dark:text-indigo-400 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> Tham số Đầu vào (Trigger Inputs)
              </span>
            </div>

            {inputSchema.length === 0 ? (
              <p className="text-slate-500 italic text-[11px]">Workflow này không yêu cầu biến đầu vào đặc biệt.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {inputSchema.map((field: any) => (
                  <div key={field.key} className="space-y-1">
                    <label className="block font-semibold text-slate-800 dark:text-slate-200">
                      {field.label || field.key} <span className="font-mono text-indigo-500 text-[10px]">({`{{input.${field.key}}}`})</span>
                    </label>
                    {field.type === 'code' ? (
                      <textarea
                        rows={3}
                        value={inputs[field.key] ?? ''}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <input
                        type="text"
                        value={inputs[field.key] ?? ''}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Start Button */}
          <div className="flex justify-center">
            <button
              onClick={handleStartRun}
              disabled={isRunning}
              className="py-3 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-lg flex items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Đang chạy Pipeline Multi-Agent...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-white" /> Bắt đầu Thực thi Workflow
                </>
              )}
            </button>
          </div>

          {/* Realtime Output Stream View */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" /> Tiến độ & Trạng thái Đầu ra Node
            </h4>

            <div className="space-y-4">
              {outputNodes.map((node) => {
                const nodeData = node.data as WorkflowNodeData;
                const result = nodeOutputs[node.id];
                const isActive = activeNodeId === node.id;
                const hasError = errorNodeId === node.id;

                return (
                  <div
                    key={node.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-amber-50/60 dark:bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/20'
                        : result
                        ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                        : hasError
                        ? 'bg-rose-50/40 dark:bg-rose-950/30 border-rose-300'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{nodeData.agentPersona?.avatar || '🤖'}</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                          {nodeData.label}
                        </span>
                      </div>

                      <div>
                        {isActive && (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-full">
                            <Loader2 className="w-3 h-3 animate-spin" /> Đang gọi Gemini...
                          </span>
                        )}
                        {result && (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full font-mono">
                            <CheckCircle2 className="w-3 h-3" /> {result.executionTimeMs}ms • {result.tokensUsed} tokens
                          </span>
                        )}
                        {!isActive && !result && !hasError && (
                          <span className="text-[10px] text-slate-400 font-mono bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                            Chờ chạy...
                          </span>
                        )}
                      </div>
                    </div>

                    {result?.outputText && (
                      <div className="space-y-2">
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-mono whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
                          {result.outputText}
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleCopyText(result.outputText, node.id)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded text-[11px]"
                          >
                            {copiedKey === node.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            {copiedKey === node.id ? 'Đã chép' : 'Sao chép kết quả'}
                          </button>
                          <button
                            onClick={() => handleDownloadMarkdown(nodeData.label, result.outputText)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded text-[11px]"
                          >
                            <Download className="w-3 h-3" /> Tải file .md
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
