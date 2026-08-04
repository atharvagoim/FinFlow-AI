import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as aiService from "../ai/aiService";
import { runChatAssistant } from "../services/chatAssistantService";

export const categorizeExpense = asyncHandler(async (req: Request, res: Response) => {
  const result = await aiService.categorizeExpense(req.body.description, req.body.amount);
  res.json({ success: true, data: result });
});

export const extractInvoiceInfo = asyncHandler(async (req: Request, res: Response) => {
  const result = await aiService.extractInvoiceInfo(req.body.rawText);
  res.json({ success: true, data: result });
});

export const summarizeInvoice = asyncHandler(async (req: Request, res: Response) => {
  const result = await aiService.summarizeInvoice(req.body.invoiceDetails);
  res.json({ success: true, data: { summary: result } });
});

export const generatePaymentReminder = asyncHandler(async (req: Request, res: Response) => {
  const { customerName, invoiceNumber, amount, daysOverdue } = req.body;
  const result = await aiService.generatePaymentReminder(customerName, invoiceNumber, amount, daysOverdue);
  res.json({ success: true, data: { message: result } });
});

export const classifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const result = await aiService.classifyCustomerEmail(req.body.emailBody);
  res.json({ success: true, data: result });
});

export const detectDuplicateInvoice = asyncHandler(async (req: Request, res: Response) => {
  const result = await aiService.detectDuplicateInvoice(req.body.candidate, req.body.recent || []);
  res.json({ success: true, data: result });
});

export const detectFraud = asyncHandler(async (req: Request, res: Response) => {
  const result = await aiService.detectFraud(req.body);
  res.json({ success: true, data: result });
});

export const suggestApproval = asyncHandler(async (req: Request, res: Response) => {
  const result = await aiService.suggestApprovalDecision(req.body);
  res.json({ success: true, data: result });
});

export const generateReport = asyncHandler(async (req: Request, res: Response) => {
  const result = await aiService.generateFinanceReport(req.body);
  res.json({ success: true, data: { report: result } });
});

export const chat = asyncHandler(async (req: Request, res: Response) => {
  const { message } = req.body;
  const reply = await runChatAssistant(message, req.user!.sub);
  res.json({ success: true, data: reply });
});
