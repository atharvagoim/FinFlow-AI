import { NodeExecutor } from "../types";
import { resolveValue } from "../resolveTemplate";
import { env } from "../../config/env";
import { logger } from "../../utils/logger";

// Stub adapter for WhatsApp Business API. Wire up a real provider (Twilio,
// Meta Cloud API, Gupshup) by replacing the fetch call below with their
// endpoint; the node contract (config -> output) stays the same.
export const whatsappNode: NodeExecutor = async (node, ctx) => {
  const to = resolveValue(node.config.to ?? "", ctx) as string;
  const message = resolveValue(node.config.message ?? "", ctx) as string;

  if (!env.integrations.whatsappApiToken) {
    logger.info(`[whatsappNode] No WhatsApp token configured. Would send to ${to}: ${message}`);
    return { output: { simulated: true, to, message } };
  }

  // Placeholder for a real provider call.
  return { output: { sent: true, to, message } };
};
