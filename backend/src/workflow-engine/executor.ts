import { IWorkflow, IWorkflowNode } from "../models/Workflow";
import { WorkflowExecution, INodeLog } from "../models/WorkflowExecution";
import { nodeRegistry } from "./registry";
import { ExecutionContext } from "./types";
import { logger } from "../utils/logger";
import { workflowQueue } from "../jobs/queue";

const MAX_RETRIES = 2;
const RETRY_BACKOFF_MS = 1000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Builds an adjacency map { nodeId: outgoing edges[] } for graph traversal.
function buildGraph(workflow: IWorkflow) {
  const byId = new Map<string, IWorkflowNode>(workflow.nodes.map((n) => [n.id, n]));
  const outgoing = new Map<string, typeof workflow.edges>();
  for (const edge of workflow.edges) {
    if (!outgoing.has(edge.source)) outgoing.set(edge.source, []);
    outgoing.get(edge.source)!.push(edge);
  }
  return { byId, outgoing };
}

interface RunArgs {
  workflow: IWorkflow;
  executionId: string;
  triggerInput: Record<string, unknown>;
  startNodeIds?: string[]; // for resuming after a delay
  priorContext?: Record<string, unknown>;
}

// Executes a workflow graph breadth-first from its trigger node(s), honoring
// condition branches, parallel fan-out on plain edges, retries with backoff,
// and per-node execution logging. Delay nodes short-circuit the run and
// re-enqueue a resumable BullMQ job rather than blocking a worker slot.
export async function runWorkflow({ workflow, executionId, triggerInput, startNodeIds, priorContext }: RunArgs) {
  const execution = await WorkflowExecution.findById(executionId);
  if (!execution) throw new Error("Execution record not found");

  const { byId, outgoing } = buildGraph(workflow);
  const ctx: ExecutionContext = {
    executionId,
    workflowId: workflow._id.toString(),
    triggerInput,
    data: (priorContext as Record<string, unknown>) || {},
  };

  execution.status = "running";
  execution.startedAt = execution.startedAt || new Date();
  await execution.save();

  const startIds = startNodeIds?.length
    ? startNodeIds
    : workflow.nodes.filter((n) => n.type === "trigger").map((n) => n.id);

  let queue = [...startIds];
  const visited = new Set<string>();
  let hadFailure = false;

  try {
    while (queue.length > 0) {
      // Nodes at the same "wave" run in parallel (fan-out), matching the
      // product requirement for parallel execution branches.
      const wave = queue;
      queue = [];

      const waveResults = await Promise.all(
        wave.map(async (nodeId) => {
          if (visited.has(nodeId)) return null;
          visited.add(nodeId);
          const node = byId.get(nodeId);
          if (!node) return null;
          return runNode(node, ctx, execution.id);
        })
      );

      for (let i = 0; i < wave.length; i++) {
        const nodeId = wave[i];
        const result = waveResults[i];
        if (!result) continue;

        if (result.status === "failed") {
          hadFailure = true;
          continue; // don't traverse further down this branch
        }

        if (result.pauseForMs) {
          // Persist logs so far, then re-enqueue remainder for later.
          await execution.save();
          const nextEdges = (outgoing.get(nodeId) || []).map((e) => e.target);
          await workflowQueue.add(
            "resume-workflow",
            {
              workflowId: workflow._id.toString(),
              executionId,
              triggerInput,
              startNodeIds: nextEdges,
              priorContext: ctx.data,
            },
            { delay: result.pauseForMs }
          );
          execution.status = "running"; // still in progress, resumes later
          await execution.save();
          return execution; // exit early; a future job continues traversal
        }

        const edges = outgoing.get(nodeId) || [];
        const nextNodeIds = edges
          .filter((e) => !result.branch || e.sourceHandle === result.branch || !e.sourceHandle)
          .map((e) => e.target)
          .filter((id) => !visited.has(id));

        queue.push(...nextNodeIds);
      }
    }

    execution.status = hadFailure ? "partial" : "success";
  } catch (err) {
    execution.status = "failed";
    execution.error = (err as Error).message;
    logger.error(`[workflow-engine] execution ${executionId} failed: ${(err as Error).message}`);
  }

  execution.finishedAt = new Date();
  execution.durationMs = execution.startedAt ? execution.finishedAt.getTime() - execution.startedAt.getTime() : undefined;
  await execution.save();
  return execution;
}

async function runNode(node: IWorkflowNode, ctx: ExecutionContext, executionMongoId: string) {
  const executor = nodeRegistry[node.type];
  const log: INodeLog = {
    nodeId: node.id,
    nodeType: node.type,
    status: "running",
    input: ctx.data,
    startedAt: new Date(),
    retries: 0,
  };

  let attempt = 0;
  while (true) {
    try {
      const result = await executor(node, ctx);
      ctx.data[node.id] = result.output;
      log.status = "success";
      log.output = result.output;
      log.finishedAt = new Date();
      await pushLog(executionMongoId, log);
      return { status: "success" as const, pauseForMs: result.pauseForMs, branch: result.branch };
    } catch (err) {
      attempt++;
      log.retries = attempt;
      if (attempt <= MAX_RETRIES) {
        await sleep(RETRY_BACKOFF_MS * attempt);
        continue;
      }
      log.status = "failed";
      log.error = (err as Error).message;
      log.finishedAt = new Date();
      await pushLog(executionMongoId, log);
      logger.warn(`[workflow-engine] node ${node.id} (${node.type}) failed after ${attempt} attempts: ${(err as Error).message}`);
      return { status: "failed" as const };
    }
  }
}

async function pushLog(executionMongoId: string, log: INodeLog) {
  await WorkflowExecution.updateOne({ _id: executionMongoId }, { $push: { nodeLogs: log } });
}
