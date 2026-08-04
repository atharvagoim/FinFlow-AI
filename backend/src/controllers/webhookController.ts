import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { Workflow } from "../models/Workflow";
import * as workflowService from "../services/workflowService";
import { AppError } from "../utils/AppError";

// Generic inbound webhook receiver. External systems (Stripe, Razorpay,
// QuickBooks, a custom app) POST to /api/webhooks/:workflowId and the
// payload becomes the trigger input for any workflow whose triggerType is
// "webhook" and status is "active". This is what makes "Invoice Paid ->
// ..." automations fire from a real payment provider event.
export const receive = asyncHandler(async (req: Request, res: Response) => {
  const workflow = await Workflow.findById(req.params.workflowId);
  if (!workflow) throw AppError.notFound("Workflow not found");
  if (workflow.triggerType !== "webhook") throw AppError.badRequest("Workflow is not configured for webhook triggers");
  if (workflow.status !== "active") throw AppError.badRequest("Workflow is not active");

  const execution = await workflowService.triggerWorkflow(workflow._id.toString(), req.body, "webhook");
  res.status(202).json({ success: true, message: "Webhook received, workflow queued", data: { executionId: execution._id } });
});
