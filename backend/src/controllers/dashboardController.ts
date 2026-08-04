import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { Invoice } from "../models/Invoice";
import { Expense } from "../models/Expense";
import { WorkflowExecution } from "../models/WorkflowExecution";
import { AuditLog } from "../models/AuditLog";

// Aggregates everything the dashboard widgets need in one round trip so the
// frontend doesn't fan out 8 separate requests on load.
export const getSummary = asyncHandler(async (_req: Request, res: Response) => {
  const [revenueAgg, pendingCount, paidCount, expenseAgg, executionAgg, recentActivity] = await Promise.all([
    Invoice.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: { $month: "$updatedAt" }, total: { $sum: "$total" } } },
      { $sort: { _id: 1 } },
    ]),
    Invoice.countDocuments({ status: { $in: ["sent", "pending_approval", "overdue"] } }),
    Invoice.countDocuments({ status: "paid" }),
    Expense.aggregate([{ $group: { _id: "$category", total: { $sum: "$amount" } } }]),
    WorkflowExecution.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    AuditLog.find().sort({ createdAt: -1 }).limit(10).populate("actor", "name"),
  ]);

  const totalRevenue = revenueAgg.reduce((sum, m) => sum + m.total, 0);
  const totalExpenses = expenseAgg.reduce((sum, e) => sum + e.total, 0);
  const totalRuns = executionAgg.reduce((sum, e) => sum + e.count, 0);
  const successRuns = executionAgg.find((e) => e._id === "success")?.count || 0;
  const failedRuns = executionAgg.find((e) => e._id === "failed")?.count || 0;

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyRevenue = revenueAgg.map((m) => ({ month: monthNames[m._id - 1], revenue: m.total }));

  res.json({
    success: true,
    data: {
      revenue: totalRevenue,
      expenses: totalExpenses,
      pendingInvoices: pendingCount,
      paidInvoices: paidCount,
      automationRuns: totalRuns,
      workflowSuccessRate: totalRuns ? Math.round((successRuns / totalRuns) * 100) : 0,
      failedExecutions: failedRuns,
      monthlyRevenue,
      expenseBreakdown: expenseAgg.map((e) => ({ category: e._id, amount: e.total })),
      recentActivity: recentActivity.map((a) => ({
        id: a._id,
        action: a.action,
        actor: (a.actor as any)?.name || "System",
        resourceType: a.resourceType,
        createdAt: a.createdAt,
      })),
    },
  });
});
