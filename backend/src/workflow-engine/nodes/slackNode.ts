import { NodeExecutor } from "../types";
import { resolveValue } from "../resolveTemplate";
import { env } from "../../config/env";
import { logger } from "../../utils/logger";

// Posts to a Slack Incoming Webhook. If none is configured (dev/demo),
// logs the message instead so the workflow still "succeeds" for testing.
export const slackNode: NodeExecutor = async (node, ctx) => {
  const message = resolveValue(node.config.message ?? "", ctx) as string;
  const webhookUrl = (node.config.webhookUrl as string) || env.integrations.slackWebhookUrl;

  if (!webhookUrl) {
    logger.info(`[slackNode] No webhook configured. Message: ${message}`);
    return { output: { simulated: true, message } };
  }

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: message }),
  });
  return { output: { sent: res.ok, message } };
};
