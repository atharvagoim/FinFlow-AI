import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "../components/layout/AppLayout";
import { KpiCard } from "../components/dashboard/KpiCard";
import { RevenueChart } from "../components/dashboard/RevenueChart";
import { ExpenseBreakdownChart } from "../components/dashboard/ExpenseBreakdownChart";
import { RecentActivity } from "../components/dashboard/RecentActivity";
import { fetchDashboardSummary } from "../services/dashboardService";
import { formatCurrency } from "../utils/format";
import { IndianRupee, Receipt, Clock, CheckCircle2, Workflow, XCircle } from "lucide-react";

export default function DashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ["dashboard-summary"], queryFn: fetchDashboardSummary });

  return (
    <AppLayout title="Dashboard">
      {isLoading || !data ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="card-base h-28 animate-pulse bg-slate-100 dark:bg-slate-800" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Revenue" value={formatCurrency(data.revenue)} icon={IndianRupee} iconColor="green" delay={0} />
            <KpiCard label="Expenses" value={formatCurrency(data.expenses)} icon={Receipt} iconColor="amber" delay={0.05} />
            <KpiCard label="Pending Invoices" value={String(data.pendingInvoices)} icon={Clock} iconColor="brand" delay={0.1} />
            <KpiCard label="Paid Invoices" value={String(data.paidInvoices)} icon={CheckCircle2} iconColor="green" delay={0.15} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Automation Runs" value={String(data.automationRuns)} icon={Workflow} iconColor="brand" delay={0.2} />
            <KpiCard label="Workflow Success %" value={`${data.workflowSuccessRate}%`} icon={CheckCircle2} iconColor="green" delay={0.25} />
            <KpiCard label="Failed Executions" value={String(data.failedExecutions)} icon={XCircle} iconColor="red" delay={0.3} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <RevenueChart data={data.monthlyRevenue} />
            <ExpenseBreakdownChart data={data.expenseBreakdown} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2" />
            <RecentActivity items={data.recentActivity} />
          </div>
        </>
      )}
    </AppLayout>
  );
}
