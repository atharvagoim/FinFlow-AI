import { NodeExecutor } from "../types";
import { resolveValue } from "../resolveTemplate";

// Generic catch-all action node (e.g. "Update Accounting", "Mark as Paid").
// Config.action is a free-text label; config.payload is arbitrary data that
// gets template-resolved and returned as this node's output for downstream use.
export const actionNode: NodeExecutor = async (node, ctx) => {
  const payload = resolveValue(node.config.payload ?? {}, ctx);
  return { output: { action: node.config.action ?? node.label, payload } };
};
