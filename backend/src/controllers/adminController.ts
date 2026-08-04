import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/User";
import { AuditLog } from "../models/AuditLog";
import { WorkflowExecution } from "../models/WorkflowExecution";
import { AppError } from "../utils/AppError";

export const listUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await User.find().select("-passwordHash");
  res.json({ success: true, data: users });
});

export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) throw AppError.notFound("User not found");
  user.role = req.body.role;
  await user.save();
  res.json({ success: true, data: { id: user._id, role: user.role } });
});

export const deactivateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) throw AppError.notFound("User not found");
  user.isActive = req.body.isActive ?? false;
  await user.save();
  res.json({ success: true, data: { id: user._id, isActive: user.isActive } });
});

export const listAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(200).populate("actor", "name email");
  res.json({ success: true, data: logs });
});

export const listAllExecutions = asyncHandler(async (_req: Request, res: Response) => {
  const executions = await WorkflowExecution.find().sort({ createdAt: -1 }).limit(200).populate("workflow", "name");
  res.json({ success: true, data: executions });
});
