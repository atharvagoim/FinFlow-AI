import "dotenv/config";
import { app } from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/db";
import { logger } from "./utils/logger";
import { startWorker } from "./jobs/worker";

async function bootstrap() {
  await connectDB();
  app.listen(env.port, () => {
    logger.info(`FinFlow AI API listening on port ${env.port} [${env.nodeEnv}]`);

    if (process.env.RUN_WORKER_INLINE === "true") {
      // Runs the BullMQ worker in this same process. Set RUN_WORKER_INLINE=true
      // on hosts where a second always-on background process isn't available
      // on your plan (e.g. Render's free tier). For real production load,
      // prefer a separate `npm run worker` process/service instead.
      startWorker();
      logger.info("Workflow worker started inline in the API process (RUN_WORKER_INLINE=true).");
    } else {
      logger.info(`Remember to also run "npm run worker" (backend) to process workflow executions.`);
    }
  });
}

bootstrap().catch((err) => {
  logger.error(`Failed to start server: ${err.message}`);
  process.exit(1);
});
