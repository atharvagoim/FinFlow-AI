import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { Expense } from "../models/Expense";
import { categorizeExpense, detectFraud } from "../ai/aiService";
import { AppError } from "../utils/AppError";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { category, amount, description, receiptUrl, incurredAt } = req.body;

  const [aiCategory, fraud] = await Promise.all([
    categorizeExpense(description || "", amount),
    detectFraud({ description: description || "", amount, employee: req.user!.email, category }),
  ]);

  const expense = await Expense.create({
    employee: req.user!.sub,
    category: category || aiCategory.category,
    amount,
    description,
    receiptUrl,
    incurredAt: incurredAt ? new Date(incurredAt) : new Date(),
    aiCategory: aiCategory.category,
    aiFraudScore: fraud.fraudScore,
    status: "submitted",
  });

  res.status(201).json({ success: true, data: expense });
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const filter: Record<string, unknown> = {};
  if (req.user!.role === "employee") filter.employee = req.user!.sub;
  if (req.query.status) filter.status = req.query.status;
  const expenses = await Expense.find(filter).populate("employee", "name email").sort({ createdAt: -1 });
  res.json({ success: true, data: expenses });
});

export const approve = asyncHandler(async (req: Request, res: Response) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) throw AppError.notFound("Expense not found");
  expense.status = req.body.approve === false ? "rejected" : "approved";
  expense.approvedBy = req.user!.sub as any;
  await expense.save();
  res.json({ success: true, data: expense });
});
