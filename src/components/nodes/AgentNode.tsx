import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Bot,
  Search,
  Code2,
  FileJson,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Sparkles,
} from 'lucide-react';
import { WorkflowNodeData } from '../../types';

export const AgentNode = memo(({ data, selected }: { data: WorkflowNodeData; selected?: boolean }) => {
  const isRunning = data.status === 'running';
  const isCompleted = data.status === 'completed';
  const isError = data.status === 'error';

  const modelBadge = {
    'gemini-3.6-flash': { label: 'Gemini 3.6 Flash', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400' },
    'gemini-3.1-pro-preview': { label: 'Gemini 3.1 Pro', color: 'bg-purple-500/10 text-purple-600 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400' },
    'gemini-3.1-flash-lite': { label: 'Gemini 3.1 Lite', color: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400' },
    'gemini-3.1-flash-image': { label: 'Gemini Image', color: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400' },
  }[data.model] || { label: data.model, color: 'bg-slate-100 text-slate-700' };

  return (
    <div
      className={`relative min-w-[300px] max-w-[360px] rounded-xl bg-white dark:bg-slate-900 border-2 transition-all shadow-lg ${
        isRunning
          ? 'border-amber-500 ring-4 ring-amber-500/30 animate-pulse'
          : isCompleted
          ? 'border-emerald-500 dark:border-emerald-600 shadow-emerald-500/10'
          : isError
          ? 'border-rose-500 dark:border-rose-600 shadow-rose-500/10'
          : selected
          ? 'border-blue-500 ring-4 ring-blue-500/20'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
      }`}
    >
      {/* Target Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="!w-3.5 !h-3.5 !bg-blue-600 !border-2 !border-white dark:!border-slate-900 transition-transform hover:scale-125"
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-t-[10px] bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="text-lg flex-shrink-0">
            {data.agentPersona?.avatar || '🤖'}
          </div>
          <div className="truncate">
            <span className="font-bold text-xs text-slate-800 dark:text-slate-100 block truncate">
              {data.agentPersona?.name || data.label || 'AI Agent'}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate font-mono">
              {data.agentPersona?.role || 'Agent Execution Node'}
            </span>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex-shrink-0">
          {isRunning && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
              <Loader2 className="w-3 h-3 animate-spin" /> Đang chạy...
            </span>
          )}
          {isCompleted && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3 h-3" /> Hoàn thành
            </span>
          )}
          {isError && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-rose-600 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
              <XCircle className="w-3 h-3" /> Lỗi
            </span>
          )}
          {!data.status || data.status === 'idle' ? (
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-mono">
              Sẵn sàng
            </span>
          ) : null}
        </div>
      </div>

      {/* Body */}
      <div className="p-3.5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          {/* Model Tag */}
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${modelBadge.color}`}
          >
            {modelBadge.label}
          </span>

          {/* Temperature indicator */}
          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-0.5">
            <Zap className="w-3 h-3 text-amber-500" /> Temp: {data.temperature ?? 0.7}
          </span>
        </div>

        {/* Prompt Preview */}
        <div className="bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 text-xs space-y-1">
          <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide font-medium flex items-center justify-between">
            <span>Context Prompt Template:</span>
            <span className="font-mono text-[9px] text-blue-500">
              {`{{nodes.${data.label}.output}}`}
            </span>
          </div>
          <p className="text-slate-700 dark:text-slate-300 line-clamp-3 font-mono text-[11px] leading-relaxed">
            {data.contextPrompt || data.systemInstruction || 'Chưa cấu hình prompt...'}
          </p>
        </div>

        {/* Tools Badges */}
        {data.tools && data.tools.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[10px] text-slate-400 font-medium">Tools:</span>
            {data.tools.includes('googleSearch') && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                <Search className="w-2.5 h-2.5" /> Web Search
              </span>
            )}
            {data.tools.includes('codeExecution') && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-900">
                <Code2 className="w-2.5 h-2.5" /> Python Code
              </span>
            )}
            {data.tools.includes('jsonOutput') && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900">
                <FileJson className="w-2.5 h-2.5" /> JSON Schema
              </span>
            )}
          </div>
        )}

        {/* Execution Output Preview if Completed */}
        {data.executionResult && (
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1">
            <div className="flex items-center justify-between text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Kết quả vừa chạy
              </span>
              <span className="font-mono text-slate-400">
                {data.executionResult.executionTimeMs}ms • {data.executionResult.tokensUsed} tokens
              </span>
            </div>
            <div className="bg-emerald-50/50 dark:bg-emerald-950/30 p-2 rounded border border-emerald-100 dark:border-emerald-900/40 text-[11px] text-slate-700 dark:text-slate-300 line-clamp-3 font-mono">
              {data.executionResult.outputText}
            </div>
          </div>
        )}

        {/* Error message if Failed */}
        {data.errorMessage && (
          <div className="bg-rose-50 dark:bg-rose-950/40 p-2 rounded border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-300 leading-tight">
            ❌ {data.errorMessage}
          </div>
        )}
      </div>

      {/* Source Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!w-3.5 !h-3.5 !bg-blue-600 !border-2 !border-white dark:!border-slate-900 transition-transform hover:scale-125"
      />
    </div>
  );
});

AgentNode.displayName = 'AgentNode';
