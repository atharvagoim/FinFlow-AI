import { Card, CardHeader, CardTitle } from "../ui/Card";
import { formatRelativeTime } from "../../utils/format";
import { Activity } from "lucide-react";

interface ActivityItem { id: string; action: string; actor: string; resourceType: string; createdAt: string; }

export function RecentActivity({ items }: { items: ActivityItem[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
      <div className="space-y-3">
        {items.length === 0 && <p className="text-sm text-slate-400">No recent activity yet.</p>}
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              <Activity className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-slate-700 dark:text-slate-200">
                <span className="font-medium">{item.actor}</span> — {item.action.replace(/\./g, " ")}
              </p>
              <p className="text-xs text-slate-400">{formatRelativeTime(item.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
