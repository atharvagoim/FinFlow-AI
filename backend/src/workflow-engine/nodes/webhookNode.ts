import { NodeExecutor } from "../types";

// Webhook nodes represent either an inbound trigger (handled by the
// webhook route before the engine even starts) or an outbound call — for
// outbound use, config.url/method behave like the api_request node.
export const webhookNode: NodeExecutor = async (node, ctx) => {
  return { output: { registered: true, url: node.config.url ?? null, mode: node.config.mode ?? "inbound" } };
};
