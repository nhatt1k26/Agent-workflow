import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Play, SlidersHorizontal, Sparkles } from 'lucide-react';
import { WorkflowNodeData } from '../../types';

export const TriggerNode = memo(({ data, selected }: { data: WorkflowNodeData; selected?: boolean }) => {
  const schema = data.inputSchema || [];

  return (
    <div
      className={`relative min-w-[280px] max-w-[340px] rounded-xl bg-white dark:bg-slate-900 border-2 transition-all shadow-md ${
        selected
          ? 'border-indigo-500 ring-4 ring-indigo-500/20 shadow-indigo-100 dark:shadow-none'
          : 'border-indigo-200 dark:border-indigo-900/60 hover:border-indigo-400'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-t-[10px] bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-medium text-sm">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-white/20 rounded-md">
            <Play className="w-4 h-4 fill-white" />
          </div>
          <span className="font-semibold text-xs tracking-wide uppercase">Trigger / Đầu vào</span>
        </div>
        <span className="text-[10px] bg-indigo-700/60 px-2 py-0.5 rounded-full font-mono">Input Node</span>
      </div>

      {/* Body */}
      <div className="p-3.5 space-y-2.5">
        <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">
          {data.label || 'Đầu vào Yêu cầu'}
        </div>
        {data.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
            {data.description}
          </p>
        )}

        {/* Dynamic Fields List */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" /> Biến đầu vào ({schema.length}):
          </div>
          <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1 text-xs">
            {schema.length === 0 ? (
              <div className="text-slate-400 italic text-[11px] bg-slate-50 dark:bg-slate-800/50 p-2 rounded border border-dashed border-slate-200 dark:border-slate-800">
                Chưa định nghĩa biến
              </div>
            ) : (
              schema.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-2 py-1 bg-indigo-50/60 dark:bg-indigo-950/40 rounded border border-indigo-100 dark:border-indigo-900/40 text-slate-700 dark:text-slate-300 font-mono text-[11px]"
                >
                  <span className="font-semibold text-indigo-700 dark:text-indigo-400">
                    {`{{input.${f.key}}}`}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase bg-white dark:bg-slate-800 px-1 py-0.2 rounded border border-slate-200 dark:border-slate-700">
                    {f.type}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Source Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!w-3.5 !h-3.5 !bg-indigo-600 !border-2 !border-white dark:!border-slate-900 transition-transform hover:scale-125"
      />
    </div>
  );
});

TriggerNode.displayName = 'TriggerNode';
