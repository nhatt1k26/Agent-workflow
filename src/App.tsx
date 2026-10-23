import React, { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  Sparkles,
  Play,
  Plus,
  Download,
  Upload,
  Bot,
  Layers,
  History,
  Globe,
  Sliders,
  Maximize2,
  Minimize2,
  RotateCcw,
  CheckCircle2,
  Loader2,
  Trash2,
} from 'lucide-react';

import { TriggerNode } from './components/nodes/TriggerNode';
import { AgentNode } from './components/nodes/AgentNode';
import { OutputNode } from './components/nodes/OutputNode';
import { NodeInspector } from './components/NodeInspector';
import { AgentPersonasManager } from './components/AgentPersonasManager';
import { TemplatesManager } from './components/TemplatesManager';
import { ExecutionLogsManager } from './components/ExecutionLogsManager';
import { GlobalVariablesManager } from './components/GlobalVariablesManager';
import { WorkflowRunnerModal } from './components/WorkflowRunnerModal';

import { Workflow, WorkflowNodeData, AgentPersona, ExecutionLog, NodeExecutionResult } from './types';
import { DEFAULT_AGENT_PERSONAS } from './data/personas';
import { WORKFLOW_TEMPLATES } from './data/templates';

const nodeTypes = {
  trigger: TriggerNode,
  agent: AgentNode,
  output: OutputNode,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'canvas' | 'personas' | 'templates' | 'logs' | 'globals'>('canvas');
  
  // Personas State
  const [agentPersonas, setAgentPersonas] = useState<AgentPersona[]>(DEFAULT_AGENT_PERSONAS);

  // Active Workflow State
  const initialWorkflow = WORKFLOW_TEMPLATES[0];
  const [workflowTitle, setWorkflowTitle] = useState(initialWorkflow.name);
  const [globalVariables, setGlobalVariables] = useState<Record<string, string>>(initialWorkflow.globalVariables);

  // React Flow Nodes and Edges
  const [nodes, setNodes, onNodesChange] = useNodesState(initialWorkflow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialWorkflow.edges);

  // Selected Node for Inspector
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Execution & Modal States
  const [isRunnerOpen, setIsRunnerOpen] = useState(false);
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [isTestingSingleNode, setIsTestingSingleNode] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [errorNodeId, setErrorNodeId] = useState<string | null>(null);

  const [nodeOutputs, setNodeOutputs] = useState<Record<string, NodeExecutionResult>>({});
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);

  // Edge Connection Handler
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  // Node Selection Handler
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // Selected Node Data Memo
  const selectedNodeObject = useMemo(() => {
    if (!selectedNodeId) return null;
    const node = nodes.find((n) => n.id === selectedNodeId);
    if (!node) return null;
    return { id: node.id, data: node.data as WorkflowNodeData };
  }, [selectedNodeId, nodes]);

  // Node Property Update Handler
  const handleUpdateNodeData = useCallback(
    (nodeId: string, newData: Partial<WorkflowNodeData>) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === nodeId) {
            return {
              ...n,
              data: {
                ...n.data,
                ...newData,
              },
            };
          }
          return n;
        })
      );
    },
    [setNodes]
  );

  // Add New Node onto Canvas
  const handleAddNode = useCallback(
    (type: 'trigger' | 'agent' | 'output', personaId?: string) => {
      const id = `node_${Date.now()}`;
      const persona = agentPersonas.find((p) => p.id === personaId) || agentPersonas[0];

      const newNode: Node = {
        id,
        type,
        position: { x: 250 + Math.random() * 100, y: 150 + Math.random() * 100 },
        data: {
          label: type === 'agent' ? persona.name : type === 'trigger' ? 'Đầu vào Yêu cầu Mới' : 'Kết quả Output',
          type,
          agentId: persona.id,
          agentPersona: persona,
          model: persona.defaultModel,
          systemInstruction: persona.systemInstruction,
          contextPrompt: type === 'agent' ? `Thực thi công việc từ dữ liệu đầu vào...` : '',
          temperature: persona.defaultTemperature,
          tools: [...persona.defaultTools],
          inputSchema: type === 'trigger' ? [{ key: 'topic', label: 'Chủ đề', type: 'string', defaultValue: '' }] : [],
          triggerInputs: type === 'trigger' ? { topic: '' } : {},
        } as WorkflowNodeData,
      };

      setNodes((nds) => [...nds, newNode]);
      setSelectedNodeId(id);
    },
    [agentPersonas, setNodes]
  );

  // Load Workflow Template
  const handleLoadTemplate = useCallback(
    (template: Workflow) => {
      setWorkflowTitle(template.name);
      setGlobalVariables(template.globalVariables);
      setNodes(template.nodes);
      setEdges(template.edges);
      setSelectedNodeId(null);
      setNodeOutputs({});
      setActiveTab('canvas');
    },
    [setNodes, setEdges]
  );

  // Single Node Test Run
  const handleTestRunNode = useCallback(
    async (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      const nodeData = node.data as WorkflowNodeData;
      setIsTestingSingleNode(true);
      setActiveNodeId(nodeId);

      // Collect inputs from trigger nodes
      const triggerNode = nodes.find((n) => n.data.type === 'trigger');
      const triggerInputs = triggerNode?.data.triggerInputs || {};

      // Collect outputs from other nodes
      const currentOutputs: Record<string, { outputText: string; jsonOutput?: any }> = {};
      Object.entries(nodeOutputs).forEach(([k, v]) => {
        currentOutputs[k] = { outputText: v.outputText, jsonOutput: v.jsonOutput };
      });

      // Update node status to running
      handleUpdateNodeData(nodeId, { status: 'running', errorMessage: undefined });

      try {
        const response = await fetch('/api/workflow/run-node', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nodeId,
            model: nodeData.model,
            systemInstruction: nodeData.systemInstruction,
            contextPrompt: nodeData.contextPrompt,
            temperature: nodeData.temperature,
            tools: nodeData.tools,
            inputs: triggerInputs,
            nodeOutputs: currentOutputs,
            globals: globalVariables,
          }),
        });

        const data = await response.json();

        if (data.success) {
          const resObj: NodeExecutionResult = {
            outputText: data.outputText,
            jsonOutput: data.jsonOutput,
            groundingChunks: data.groundingChunks,
            tokensUsed: data.tokensUsed,
            executionTimeMs: data.executionTimeMs,
            timestamp: new Date().toISOString(),
          };

          setNodeOutputs((prev) => ({ ...prev, [nodeId]: resObj }));
          handleUpdateNodeData(nodeId, { status: 'completed', executionResult: resObj });
        } else {
          handleUpdateNodeData(nodeId, { status: 'error', errorMessage: data.error });
        }
      } catch (err: any) {
        handleUpdateNodeData(nodeId, { status: 'error', errorMessage: err.message || 'Lỗi gọi API' });
      } finally {
        setIsTestingSingleNode(false);
        setActiveNodeId(null);
      }
    },
    [nodes, nodeOutputs, globalVariables, handleUpdateNodeData]
  );

  // Full Pipeline Workflow Execution (Topological Step-by-Step Execution)
  const handleExecuteFullPipeline = useCallback(
    async (userInputs: Record<string, string>) => {
      setIsRunningPipeline(true);
      setErrorNodeId(null);

      // Sort nodes or run sequentially
      const nonTriggerNodes = nodes.filter((n) => n.data.type !== 'trigger');

      // Update trigger node inputs
      const triggerNode = nodes.find((n) => n.data.type === 'trigger');
      if (triggerNode) {
        handleUpdateNodeData(triggerNode.id, { triggerInputs: userInputs, status: 'completed' });
      }

      // Reset status for other nodes
      nonTriggerNodes.forEach((n) => {
        handleUpdateNodeData(n.id, { status: 'idle', errorMessage: undefined });
      });

      const accumulatedOutputs: Record<string, NodeExecutionResult> = {};
      const stepLogs: any[] = [];
      let totalTokens = 0;
      let totalDuration = 0;
      const startTime = Date.now();

      try {
        for (const node of nonTriggerNodes) {
          const nodeId = node.id;
          const nodeData = node.data as WorkflowNodeData;

          setActiveNodeId(nodeId);
          handleUpdateNodeData(nodeId, { status: 'running' });

          const formattedNodeOutputs: Record<string, { outputText: string; jsonOutput?: any }> = {};
          Object.entries(accumulatedOutputs).forEach(([k, v]) => {
            formattedNodeOutputs[k] = { outputText: v.outputText, jsonOutput: v.jsonOutput };
          });

          const response = await fetch('/api/workflow/run-node', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nodeId,
              model: nodeData.model,
              systemInstruction: nodeData.systemInstruction,
              contextPrompt: nodeData.contextPrompt,
              temperature: nodeData.temperature,
              tools: nodeData.tools,
              inputs: userInputs,
              nodeOutputs: formattedNodeOutputs,
              globals: globalVariables,
            }),
          });

          const data = await response.json();

          if (data.success) {
            const result: NodeExecutionResult = {
              outputText: data.outputText,
              jsonOutput: data.jsonOutput,
              groundingChunks: data.groundingChunks,
              tokensUsed: data.tokensUsed,
              executionTimeMs: data.executionTimeMs,
              timestamp: new Date().toISOString(),
            };

            accumulatedOutputs[nodeId] = result;
            setNodeOutputs({ ...accumulatedOutputs });

            handleUpdateNodeData(nodeId, { status: 'completed', executionResult: result });

            totalTokens += data.tokensUsed || 0;
            totalDuration += data.executionTimeMs || 0;

            stepLogs.push({
              nodeId,
              nodeLabel: nodeData.label,
              nodeType: nodeData.type,
              status: 'completed',
              promptSent: data.promptSent,
              outputText: data.outputText,
              durationMs: data.executionTimeMs,
              tokensUsed: data.tokensUsed,
            });
          } else {
            handleUpdateNodeData(nodeId, { status: 'error', errorMessage: data.error });
            setErrorNodeId(nodeId);
            stepLogs.push({
              nodeId,
              nodeLabel: nodeData.label,
              nodeType: nodeData.type,
              status: 'failed',
              error: data.error,
            });
            throw new Error(`Node ${nodeData.label} thất bại: ${data.error}`);
          }
        }

        // Record Execution Log
        const newLog: ExecutionLog = {
          id: `log_${Date.now()}`,
          workflowId: 'wf_active',
          workflowName: workflowTitle,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date().toISOString(),
          status: 'completed',
          totalTokens,
          totalDurationMs: Date.now() - startTime,
          nodeLogs: stepLogs,
          initialInputs: userInputs,
        };

        setExecutionLogs((prev) => [newLog, ...prev]);
      } catch (err: any) {
        console.error('Pipeline execution error:', err);
      } finally {
        setIsRunningPipeline(false);
        setActiveNodeId(null);
      }
    },
    [nodes, globalVariables, workflowTitle, handleUpdateNodeData]
  );

  // Export Workflow JSON
  const handleExportJSON = () => {
    const wfObj: Workflow = {
      id: `wf_${Date.now()}`,
      name: workflowTitle,
      description: 'Workflow AI Agent export',
      version: '1.0.0',
      nodes,
      edges,
      globalVariables,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(wfObj, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `${workflowTitle.toLowerCase().replace(/\s+/g, '_')}_workflow.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Import Workflow JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.nodes && parsed.edges) {
            setWorkflowTitle(parsed.name || 'Imported Workflow');
            setNodes(parsed.nodes);
            setEdges(parsed.edges);
            if (parsed.globalVariables) setGlobalVariables(parsed.globalVariables);
            alert('Nhập Workflow JSON thành công!');
          }
        } catch (err) {
          alert('File JSON không hợp lệ.');
        }
      };
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* Header Bar */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-5 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                AgentFlow AI
              </h1>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">
                Workflow Orchestrator
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />

          {/* Workflow Title Input */}
          <input
            type="text"
            value={workflowTitle}
            onChange={(e) => setWorkflowTitle(e.target.value)}
            className="font-bold text-sm bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none px-1 py-0.5 text-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Tab Navigation */}
        <nav className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('canvas')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'canvas'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" /> Canvas Editor
          </button>
          <button
            onClick={() => setActiveTab('personas')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'personas'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Bot className="w-4 h-4" /> AI Agents ({agentPersonas.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'templates'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Kho Templates
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'logs'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" /> Lịch sử ({executionLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('globals')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'globals'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4" /> Biến Toàn Cục
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <label className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700 transition-colors">
            <Upload className="w-4 h-4" />
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>

          <button
            onClick={handleExportJSON}
            title="Xuất Workflow JSON"
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsRunnerOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" /> Chạy Workflow
          </button>
        </div>
      </header>

      {/* Main Container View */}
      <div className="flex-1 relative flex overflow-hidden">
        {activeTab === 'canvas' && (
          <div className="flex-1 relative flex">
            {/* ReactFlow Workspace */}
            <ReactFlowProvider>
              <div className="flex-1 h-full w-full relative">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onNodeClick={onNodeClick}
                  onPaneClick={onPaneClick}
                  nodeTypes={nodeTypes}
                  fitView
                  attributionPosition="bottom-right"
                >
                  <Background gap={20} size={1} color="#cbd5e1" />
                  <Controls />
                  <MiniMap nodeStrokeWidth={3} zoomable pannable className="!bg-white dark:!bg-slate-900 !rounded-xl !border-slate-200 dark:!border-slate-800" />

                  {/* Top Canvas Toolbar Panel */}
                  <Panel position="top-left" className="m-4 flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
                    <span className="text-xs font-bold text-slate-500 px-2 uppercase tracking-wider">
                      Thêm Node:
                    </span>
                    <button
                      onClick={() => handleAddNode('agent')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 rounded-xl text-xs font-semibold border border-indigo-200 dark:border-indigo-800 transition-colors"
                    >
                      <Bot className="w-4 h-4" /> + AI Agent Node
                    </button>
                    <button
                      onClick={() => handleAddNode('trigger')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> + Input Trigger
                    </button>
                    <button
                      onClick={() => handleAddNode('output')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 rounded-xl text-xs font-semibold border border-emerald-200 dark:border-emerald-800 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> + Output Node
                    </button>
                  </Panel>
                </ReactFlow>
              </div>
            </ReactFlowProvider>

            {/* Right Node Inspector Drawer */}
            {selectedNodeObject && (
              <NodeInspector
                selectedNode={selectedNodeObject}
                agentPersonas={agentPersonas}
                onUpdateNode={handleUpdateNodeData}
                onClose={() => setSelectedNodeId(null)}
                onTestRunNode={handleTestRunNode}
                isTestingNode={isTestingSingleNode}
              />
            )}
          </div>
        )}

        {activeTab === 'personas' && (
          <div className="flex-1 overflow-y-auto">
            <AgentPersonasManager
              personas={agentPersonas}
              onAddPersona={(p) => setAgentPersonas([...agentPersonas, p])}
              onUpdatePersona={(p) => setAgentPersonas(agentPersonas.map((x) => (x.id === p.id ? p : x)))}
              onDeletePersona={(id) => setAgentPersonas(agentPersonas.filter((x) => x.id !== id))}
            />
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="flex-1 overflow-y-auto">
            <TemplatesManager
              templates={WORKFLOW_TEMPLATES}
              onSelectTemplate={handleLoadTemplate}
            />
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="flex-1 overflow-y-auto">
            <ExecutionLogsManager
              logs={executionLogs}
              onClearLogs={() => setExecutionLogs([])}
            />
          </div>
        )}

        {activeTab === 'globals' && (
          <div className="flex-1 overflow-y-auto">
            <GlobalVariablesManager
              globalVariables={globalVariables}
              onUpdateGlobalVariables={setGlobalVariables}
              workflowId="wf_active"
            />
          </div>
        )}
      </div>

      {/* Full Pipeline Runner Modal */}
      {isRunnerOpen && (
        <WorkflowRunnerModal
          workflow={{
            id: 'wf_active',
            name: workflowTitle,
            description: '',
            version: '1.0.0',
            nodes,
            edges,
            globalVariables,
            createdAt: '',
            updatedAt: '',
          }}
          onClose={() => setIsRunnerOpen(false)}
          onExecuteWorkflow={handleExecuteFullPipeline}
          isRunning={isRunningPipeline}
          nodeOutputs={nodeOutputs}
          activeNodeId={activeNodeId}
          errorNodeId={errorNodeId}
          logsHistory={executionLogs}
        />
      )}
    </div>
  );
}
