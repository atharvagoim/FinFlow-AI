import { NodeExecutor } from "../types";

// Delay nodes pause the workflow. Rather than blocking a worker thread with
// setTimeout (which wastes concurrency slots and dies on process restart),
// the engine re-enqueues the remaining graph as a delayed BullMQ job and
// exits this run. `pauseForMs` signals that to the executor.
export const delayNode: NodeExecutor = async (node) => {
  const ms = Number(node.config.ms ?? 0);
  return { output: { delayedMs: ms }, pauseForMs: ms > 0 ? ms : undefined };
};
