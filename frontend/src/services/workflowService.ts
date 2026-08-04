import { apiClient } from "../api/client";

export type NodeType =
  | "trigger" | "action" | "condition" | "webhook" | "delay" | "loop"
  | "api_request" | "database" | "ai_decision" | "email" | "slack"
  | "whatsapp" | "invoice" | "payment" | "approval";

export interface WorkflowNode {
  id: string; type: NodeType; label: string;
  position: { x: number; y: number }; config: Record<string, unknown>;
}
export interface WorkflowEdge {
  id: string; source: string; target: string; sourceHandle?: string; label?: string;
}
export interface Workflow {
  _id: string; name: string; description?: string; status: string;
  triggerType: string; nodes: WorkflowNode[]; edges: WorkflowEdge[]; tags: string[]; updatedAt: string;
}

export async function listWorkflows(): Promise<Workflow[]> {
  const { data } = await apiClient.get("/workflows");
  return data.data;
}
export async function getWorkflow(id: string): Promise<Workflow> {
  const { data } = await apiClient.get(`/workflows/${id}`);
  return data.data;
}
export async function createWorkflow(payload: Partial<Workflow>): Promise<Workflow> {
  const { data } = await apiClient.post("/workflows", payload);
  return data.data;
}
export async function updateWorkflow(id: string, payload: Partial<Workflow>): Promise<Workflow> {
  const { data } = await apiClient.put(`/workflows/${id}`, payload);
  return data.data;
}
export async function deleteWorkflow(id: string): Promise<void> {
  await apiClient.delete(`/workflows/${id}`);
}
export async function triggerWorkflow(id: string, input: Record<string, unknown> = {}) {
  const { data } = await apiClient.post(`/workflows/${id}/trigger`, { input });
  return data.data;
}
export async function generateWorkflowFromPrompt(prompt: string): Promise<Workflow> {
  const { data } = await apiClient.post("/workflows/generate", { prompt });
  return data.data;
}
export async function listExecutions(workflowId?: string) {
  const { data } = await apiClient.get("/workflows/executions", { params: { workflowId } });
  return data.data;
}
