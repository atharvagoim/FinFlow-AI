import { Queue } from "bullmq";
import { redisConnection } from "../config/redis";

// Single queue for all workflow executions. BullMQ handles retries/backoff
// at the job level too, but our engine does its own per-node retry logic —
// the queue-level `attempts: 1` avoids double-retrying an entire graph.
export const workflowQueue = new Queue("workflow-executions", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: { age: 60 * 60 * 24 * 7, count: 1000 },
    removeOnFail: { age: 60 * 60 * 24 * 30 },
  },
});

export interface WorkflowJobData {
  workflowId: string;
  executionId: string;
  triggerInput: Record<string, unknown>;
  startNodeIds?: string[];
  priorContext?: Record<string, unknown>;
}
