export type AgentModel = 
  | 'gemini-3.6-flash'
  | 'gemini-3.1-pro-preview'
  | 'gemini-3.1-flash-lite'
  | 'gemini-3.1-flash-image';

export type AgentTool = 'googleSearch' | 'jsonOutput' | 'codeExecution';

export interface AgentPersona {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  description: string;
  systemInstruction: string;
  defaultModel: AgentModel;
  defaultTemperature: number;
  defaultTools: AgentTool[];
}

export type WorkflowNodeType = 'trigger' | 'agent' | 'condition' | 'formatter' | 'output';

export interface InputSchemaField {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'code';
  required?: boolean;
  defaultValue?: string;
}

export interface OutputVariableField {
  key: string;
  description: string;
}

export interface ConditionRule {
  field: string; // variable to evaluate e.g. {{nodes.node_1.output}}
  operator: 'contains' | 'equals' | 'not_equals' | 'length_gt';
  value: string;
}

export interface NodeExecutionResult {
  outputText: string;
  jsonOutput?: Record<string, any>;
  groundingChunks?: Array<{ title?: string; uri?: string }>;
  tokensUsed?: number;
  executionTimeMs?: number;
  timestamp?: string;
}

export interface WorkflowNodeData {
  label: string;
  type: WorkflowNodeType;
  description?: string;
  agentId?: string;
  agentPersona?: AgentPersona;
  model: AgentModel;
  systemInstruction: string;
  contextPrompt: string;
  temperature: number;
  topP?: number;
  maxTokens?: number;
  thinkingLevel?: 'LOW' | 'HIGH' | 'MINIMAL';
  tools: AgentTool[];
  inputSchema?: InputSchemaField[];
  outputVariables?: OutputVariableField[];
  conditionRule?: ConditionRule;
  
  // Dynamic runtime state
  status?: 'idle' | 'running' | 'completed' | 'error';
  executionResult?: NodeExecutionResult;
  errorMessage?: string;
  
  // Custom user inputs for Trigger node
  triggerInputs?: Record<string, string>;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  version: string;
  category?: string;
  nodes: any[];
  edges: any[];
  globalVariables: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface NodeLogItem {
  nodeId: string;
  nodeLabel: string;
  nodeType: WorkflowNodeType;
  status: 'pending' | 'running' | 'completed' | 'failed';
  promptSent?: string;
  outputText?: string;
  error?: string;
  durationMs?: number;
  tokensUsed?: number;
  groundingChunks?: Array<{ title?: string; uri?: string }>;
}

export interface ExecutionLog {
  id: string;
  workflowId: string;
  workflowName: string;
  startTime: string;
  endTime?: string;
  status: 'running' | 'completed' | 'failed';
  totalTokens: number;
  totalDurationMs: number;
  nodeLogs: NodeLogItem[];
  initialInputs?: Record<string, string>;
  finalOutputs?: Record<string, string>;
}
