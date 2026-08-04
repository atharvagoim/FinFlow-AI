import { cn } from "../../utils/cn";

const colorMap: Record<string, string> = {
  green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  red: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  yellow: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  slate: "bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300",
  brand: "bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300",
};

export function Badge({ color = "slate", children, className }: { color?: keyof typeof colorMap; children: React.ReactNode; className?: string }) {
  return <span className={cn("badge", colorMap[color], className)}>{children}</span>;
}

export function statusColor(status: string): keyof typeof colorMap {
  const map: Record<string, keyof typeof colorMap> = {
    paid: "green", succeeded: "green", success: "green", approved: "green", active: "green",
    pending: "yellow", pending_approval: "yellow", queued: "yellow", running: "yellow", draft: "slate",
    failed: "red", overdue: "red", rejected: "red", cancelled: "red",
    sent: "blue", processing: "blue",
  };
  return map[status] || "slate";
}
