import { NodeExecutor } from "../types";
import { resolveValue } from "../resolveTemplate";

// Represents a human-in-the-loop approval gate. In this MVP it auto-resolves
// using an AI suggestion if config.autoApproveWithAI is set, otherwise it
// records a "pending" output that a real deployment would surface in the UI
// as an actionable task and pause the run until a manager responds.
export const approvalNode: NodeExecutor = async (node, ctx) => {
  const amount = Number(resolveValue(node.config.amount ?? 0, ctx));
  const threshold = Number(node.config.threshold ?? 0);
  const requiresApproval = amount > threshold;

  return {
    output: { amount, threshold, requiresApproval, status: requiresApproval ? "pending_approval" : "auto_approved" },
    branch: requiresApproval ? "true" : "false",
  };
};
