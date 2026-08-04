import { Worker, Job } from "bullmq";
import { redisConnection } from "../config/redis";
import { Workflow } from "../models/Workflow";
import { runWorkflow } from "../workflow-engine/executor";
import { WorkflowJobData } from "./queue";
import { logger } from "../utils/logger";

// Starts the BullMQ worker that actually executes workflows. Exported so it
// can run two ways:
//  1. Standalone process (`npm run worker`) — the recommended production
//     setup, so execution load never competes with API request handling.
//  2. Inline inside the API process (`RUN_WORKER_INLINE=true`) — for
//     free-tier hosts (e.g. Render's free web service) that don't offer a
//     second always-on process type without a paid plan. Fine for demos/low
//     volume; just note both roles now share the same CPU/memory.
export function startWorker(): Worker<WorkflowJobData> {
  const worker = new Worker<WorkflowJobData>(
    "workflow-executions",
    async (job: Job<WorkflowJobData>) => {
      const { workflowId, executionId, triggerInput, startNodeIds, priorContext } = job.data;
      const workflow = await Workflow.findById(workflowId);
      if (!workflow) throw new Error(`Workflow ${workflowId} not found`);

      await runWorkflow({ workflow, executionId, triggerInput, startNodeIds, priorContext });
    },
    { connection: redisConnection, concurrency: 5 }
  );

  worker.on("completed", (job) => logger.info(`[worker] job ${job.id} completed`));
  worker.on("failed", (job, err) => logger.error(`[worker] job ${job?.id} failed: ${err.message}`));

  logger.info("Workflow worker started, listening for jobs...");
  return worker;
}

// Entry point for `npm run worker` (standalone process). Only runs the
// connectDB + start sequence when this file is executed directly, not when
// startWorker is imported elsewhere (e.g. server.ts for inline mode).
if (require.main === module) {
  import("dotenv/config").then(async () => {
    const { connectDB } = await import("../config/db");
    try {
      await connectDB();
      startWorker();
    } catch (err) {
      logger.error(`Worker failed to start: ${(err as Error).message}`);
      process.exit(1);
    }
  });
}
