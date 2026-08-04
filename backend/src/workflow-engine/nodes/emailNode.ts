import { NodeExecutor } from "../types";
import { resolveValue } from "../resolveTemplate";
import { sendEmail } from "../../services/emailService";

export const emailNode: NodeExecutor = async (node, ctx) => {
  const to = resolveValue(node.config.to ?? "", ctx) as string;
  const subject = resolveValue(node.config.subject ?? "Notification from FinFlow AI", ctx) as string;
  const body = resolveValue(node.config.body ?? "", ctx) as string;

  if (!to) return { output: { skipped: true, reason: "No recipient configured" } };

  await sendEmail({ to, subject, html: `<div style="font-family:sans-serif">${body}</div>` });
  return { output: { sentTo: to, subject } };
};
