import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as workflowService from "../services/workflowService";
import { AppError } from "../utils/AppError";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const workflow = await workflowService.createWorkflow(req.user!.sub, req.body);
  res.status(201).json({ success: true, data: workflow });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const workflow = await workflowService.updateWorkflow(req.params.id, req.user!.sub, req.body);
  res.json({ success: true, data: workflow });
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const workflows = await workflowService.listWorkflows();
  res.json({ success: true, data: workflows });
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const workflow = await workflowService.getWorkflow(req.params.id);
  res.json({ success: true, data: workflow });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await workflowService.deleteWorkflow(req.params.id);
  res.json({ success: true, message: "Workflow deleted" });
});

export const trigger = asyncHandler(async (req: Request, res: Response) => {
  const execution = await workflowService.triggerWorkflow(req.params.id, req.body.input || {}, "manual");
  res.status(202).json({ success: true, message: "Workflow queued for execution", data: execution });
});

export const executions = asyncHandler(async (req: Request, res: Response) => {
  const list = await workflowService.listExecutions(req.query.workflowId as string | undefined);
  res.json({ success: true, data: list });
});

export const executionDetail = asyncHandler(async (req: Request, res: Response) => {
  const execution = await workflowService.getExecution(req.params.id);
  res.json({ success: true, data: execution });
});

export const generateFromPrompt = asyncHandler(async (req: Request, res: Response) => {
  if (!req.body.prompt) throw AppError.badRequest("prompt is required");
  const workflow = await workflowService.generateWorkflowFromNaturalLanguage(req.user!.sub, req.body.prompt);
  res.status(201).json({ success: true, data: workflow });
});
