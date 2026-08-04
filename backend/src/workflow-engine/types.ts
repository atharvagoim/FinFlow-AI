import { IWorkflowNode } from "../models/Workflow";

// Shared mutable state passed between node executors within a single
// workflow run. Node outputs are merged into `data` under their node id so
// downstream nodes can reference `{{nodeId.field}}` style bindings.
export interface ExecutionContext {
  executionId: string;
  workflowId: string;
  triggerInput: Record<string, unknown>;
  data: Record<string, unknown>; // keyed by nodeId -> output
  userId?: string;
}

export interface NodeResult {
  output: unknown;
  // For condition nodes: which outgoing edge handle to follow ("true"/"false").
  branch?: string;
  // If set, the engine pauses here and resumes later (used by delay nodes).
  pauseForMs?: number;
}

export type NodeExecutor = (node: IWorkflowNode, ctx: ExecutionContext) => Promise<NodeResult>;
