import React, { useState } from 'react';
import { ExecutionLog, NodeLogItem } from '../types';
import { History, CheckCircle2, XCircle, Clock, Zap, ChevronRight, FileText, Bot } from 'lucide-react';

interface ExecutionLogsManagerProps {
  logs: ExecutionLog[];
  onClearLogs: () => void;
}

export const ExecutionLogsManager: React.FC<ExecutionLogsManagerProps> = ({ logs, onClearLogs }) => {
  const [selectedLog, setSelectedLog] = useState<ExecutionLog | null>(null);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between bg-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold">Lịch sử Thực thi & Token Analytics</h2>
          </div>
          <p className="text-sm text-slate-300">
            Nhật ký các lượt chạy workflow, chi tiết token tiêu thụ, thời gian phản hồi latency và kết quả từng node.
          </p>
        </div>
        {logs.length > 0 && (
          <button
            onClick={onClearLogs}
            className="px-3.5 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
          >
            Xóa lịch sử
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Logs List */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 overflow-hidden">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 px-2">
            Danh sách Lượt Chạy ({logs.length})
          </h3>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Chưa có lượt chạy workflow nào.
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    selectedLog?.id === log.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">
                      {log.workflowName}
                    </span>
                    {log.status === 'completed' ? (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Thành công
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full font-medium">
                        <XCircle className="w-3 h-3" /> Thất bại
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {new Date(log.startTime).toLocaleTimeString()}
                    </span>
                    <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                      <Zap className="w-3 h-3" /> {log.totalTokens} tokens
                    </span>
                    <span>{log.totalDurationMs}ms</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Log Inspector */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
          {selectedLog ? (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    Chi tiết Execution Log
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">Run ID: {selectedLog.id}</p>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tổng Thời Gian</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedLog.totalDurationMs}ms</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tổng Token</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{selectedLog.totalTokens}</span>
                  </div>
                </div>
              </div>

              {/* Step Logs per node */}
              <div className="space-y-4">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-400">
                  Nhật ký từng bước Node Execution ({selectedLog.nodeLogs.length} bước)
                </h4>

                <div className="space-y-3">
                  {selectedLog.nodeLogs.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4 text-indigo-500" />
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {item.nodeLabel}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-400">
                          {item.durationMs}ms • {item.tokensUsed} tokens
                        </span>
                      </div>

                      {item.promptSent && (
                        <div>
                          <span className="text-[10px] text-slate-400 block mb-0.5">Prompt Đã Gửi:</span>
                          <div className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400 line-clamp-2">
                            {item.promptSent}
                          </div>
                        </div>
                      )}

                      {item.outputText && (
                        <div>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mb-0.5 font-semibold">
                            Kết Quả Trả Về:
                          </span>
                          <div className="p-2.5 bg-emerald-50/40 dark:bg-emerald-950/30 rounded border border-emerald-100 dark:border-emerald-900/40 text-[11px] font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap max-h-48 overflow-y-auto">
                            {item.outputText}
                          </div>
                        </div>
                      )}

                      {item.error && (
                        <div className="p-2 bg-rose-50 text-rose-600 rounded border border-rose-200 text-xs">
                          ❌ Lỗi: {item.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs space-y-2">
              <FileText className="w-8 h-8 text-slate-300" />
              <span>Chọn một lượt chạy ở cột bên trái để xem chi tiết prompt & kết quả từng node.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
