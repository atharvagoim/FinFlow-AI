import { apiClient } from "../api/client";

export interface DashboardSummary {
  revenue: number;
  expenses: number;
  pendingInvoices: number;
  paidInvoices: number;
  automationRuns: number;
  workflowSuccessRate: number;
  failedExecutions: number;
  monthlyRevenue: { month: string; revenue: number }[];
  expenseBreakdown: { category: string; amount: number }[];
  recentActivity: { id: string; action: string; actor: string; resourceType: string; createdAt: string }[];
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await apiClient.get("/dashboard/summary");
  return data.data;
}
