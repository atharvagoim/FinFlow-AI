import { NodeExecutor } from "../types";
import { resolveValue } from "../resolveTemplate";
import { Payment } from "../../models/Payment";

// Verifies or records a payment as part of an automation, e.g. the first
// step of the "Invoice Paid" example workflow from the product spec.
export const paymentNode: NodeExecutor = async (node, ctx) => {
  const paymentId = resolveValue(node.config.paymentId ?? "{{trigger.paymentId}}", ctx) as string;
  const action = (node.config.action as string) ?? "verify";

  const payment = await Payment.findById(paymentId);
  if (!payment) return { output: { verified: false, reason: "Payment not found" } };

  if (action === "verify") {
    return { output: { verified: payment.status === "succeeded", status: payment.status } };
  }

  return { output: { skipped: true } };
};
