import React from 'react';
import { Workflow } from '../types';
import { Sparkles, Layers, ArrowRight, FolderKanban, CheckCircle2 } from 'lucide-react';

interface TemplatesManagerProps {
  templates: Workflow[];
  onSelectTemplate: (template: Workflow) => void;
}

export const TemplatesManager: React.FC<TemplatesManagerProps> = ({
  templates,
  onSelectTemplate,
}) => {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold">Kho Template Workflow AI Agent Mẫu</h2>
          </div>
          <p className="text-sm text-slate-300">
            Khởi tạo nhanh chóng hệ thống AI Agent đa bước với các kịch bản chuẩn cho Marketing, Software Engineering & Customer Support.
          </p>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-5 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  {tpl.category || 'Multi-Agent'}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  v{tpl.version}
                </span>
              </div>

              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {tpl.name}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {tpl.description}
              </p>

              {/* Node Pipeline Flow Visual */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                  Chuỗi Agent trong Workflow ({tpl.nodes.length} nodes):
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {tpl.nodes.map((node, i) => (
                    <React.Fragment key={node.id}>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {node.data.agentPersona?.avatar || '⚡'} {node.data.label}
                      </span>
                      {i < tpl.nodes.length - 1 && (
                        <span className="text-slate-300 dark:text-slate-600">→</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectTemplate(tpl)}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <Layers className="w-4 h-4" /> Sử dụng Template này vào Canvas
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
