import { Workflow, IWorkflow } from "../models/Workflow";
import { WorkflowExecution } from "../models/WorkflowExecution";
import { workflowQueue } from "../jobs/queue";
import { AppError } from "../utils/AppError";
import { generateWorkflowFromPrompt } from "../ai/aiService";
import { v4 as uuid } from "uuid";

export async function createWorkflow(ownerId: string, payload: Partial<IWorkflow>) {
  return Workflow.create({ ...payload, owner: ownerId });
}

export async function updateWorkflow(id: string, ownerId: string, payload: Partial<IWorkflow>) {
  const workflow = await Workflow.findOneAndUpdate(
    { _id: id },
    { $set: payload, $inc: { version: 1 } },
    { new: true }
  );
  if (!workflow) throw AppError.notFound("Workflow not found");
  return workflow;
}

export async function listWorkflows(ownerId?: string) {
  const filter = ownerId ? { owner: ownerId } : {};
  return Workflow.find(filter).sort({ updatedAt: -1 });
}

export async function getWorkflow(id: string) {
  const workflow = await Workflow.findById(id);
  if (!workflow) throw AppError.notFound("Workflow not found");
  return workflow;
}

export async function deleteWorkflow(id: string) {
  const result = await Workflow.findByIdAndDelete(id);
  if (!result) throw AppError.notFound("Workflow not found");
}

// Enqueues a workflow run and immediately returns the execution record so
// the frontend can poll/subscribe to its status while it processes async.
export async function triggerWorkflow(workflowId: string, input: Record<string, unknown>, triggeredBy: "manual" | "event" | "webhook" | "schedule" = "manual") {
  const workflow = await Workflow.findById(workflowId);
  if (!workflow) throw AppError.notFound("Workflow not found");
  if (workflow.status === "archived") throw AppError.badRequest("Cannot run an archived workflow");

  const execution = await WorkflowExecution.create({
    workflow: workflow._id,
    triggeredBy,
    status: "queued",
    input,
  });

  await workflowQueue.add("run-workflow", {
    workflowId: workflow._id.toString(),
    executionId: execution._id.toString(),
    triggerInput: input,
  });

  return execution;
}

export async function listExecutions(workflowId?: string, limit = 50) {
  const filter = workflowId ? { workflow: workflowId } : {};
  return WorkflowExecution.find(filter).sort({ createdAt: -1 }).limit(limit).populate("workflow", "name");
}

export async function getExecution(id: string) {
  const execution = await WorkflowExecution.findById(id).populate("workflow", "name nodes edges");
  if (!execution) throw AppError.notFound("Execution not found");
  return execution;
}

// Natural-language workflow generation: turns a prompt into a persisted
// draft workflow the user can review/edit in the builder before activating.
export async function generateWorkflowFromNaturalLanguage(ownerId: string, prompt: string) {
  const generated = await generateWorkflowFromPrompt(prompt);
  const nodes = generated.nodes.map((n) => ({ ...n, id: n.id || uuid() }));
  return Workflow.create({
    name: generated.name,
    description: generated.description,
    owner: ownerId,
    status: "draft",
    triggerType: generated.triggerType,
    nodes,
    edges: generated.edges,
    tags: ["ai-generated"],
  });
}
