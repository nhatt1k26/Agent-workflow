import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Flag, Sparkles, CheckCircle2 } from 'lucide-react';
import { WorkflowNodeData } from '../../types';

export const OutputNode = memo(({ data, selected }: { data: WorkflowNodeData; selected?: boolean }) => {
  const isCompleted = data.status === 'completed';

  return (
    <div
      className={`relative min-w-[280px] max-w-[340px] rounded-xl bg-white dark:bg-slate-900 border-2 transition-all shadow-md ${
        isCompleted
          ? 'border-emerald-500 ring-4 ring-emerald-500/20'
          : selected
          ? 'border-emerald-500 ring-4 ring-emerald-500/20'
          : 'border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-400'
      }`}
    >
      {/* Target Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="!w-3.5 !h-3.5 !bg-emerald-600 !border-2 !border-white dark:!border-slate-900 transition-transform hover:scale-125"
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-t-[10px] bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium text-sm">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-white/20 rounded-md">
            <Flag className="w-4 h-4 fill-white" />
          </div>
          <span className="font-semibold text-xs tracking-wide uppercase">Output / Kết quả</span>
        </div>
        <span className="text-[10px] bg-emerald-800/60 px-2 py-0.5 rounded-full font-mono">End Node</span>
      </div>

      {/* Body */}
      <div className="p-3.5 space-y-2">
        <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">
          {data.label || 'Đầu ra Báo cáo Cuối cùng'}
        </div>
        {data.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {data.description}
          </p>
        )}

        {/* Format Template Preview */}
        <div className="bg-emerald-50/50 dark:bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900/40 text-xs space-y-1">
          <div className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase tracking-wide font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Mẫu định dạng đầu ra:
          </div>
          <p className="text-slate-700 dark:text-slate-300 line-clamp-3 font-mono text-[11px]">
            {data.contextPrompt || 'Tổng hợp tự động từ các Agent...'}
          </p>
        </div>

        {isCompleted && (
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 pt-1">
            <CheckCircle2 className="w-4 h-4" /> Đã hoàn thành toàn bộ Pipeline
          </div>
        )}
      </div>
    </div>
  );
});

OutputNode.displayName = 'OutputNode';
