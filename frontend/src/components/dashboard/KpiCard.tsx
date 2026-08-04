import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

interface KpiCardProps {
  label: string; value: string; icon: LucideIcon; trend?: string; trendUp?: boolean; iconColor?: string; delay?: number;
}

export function KpiCard({ label, value, icon: Icon, trend, trendUp, iconColor = "brand", delay = 0 }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay }}
      className="card-base"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 font-display text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
          {trend && (
            <p className={cn("mt-1.5 text-xs font-medium", trendUp ? "text-emerald-600" : "text-red-500")}>{trend}</p>
          )}
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl",
          iconColor === "brand" && "bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400",
          iconColor === "green" && "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
          iconColor === "red" && "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400",
          iconColor === "amber" && "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
        )}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}
