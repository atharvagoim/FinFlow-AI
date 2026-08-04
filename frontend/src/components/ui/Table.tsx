import { ReactNode } from "react";
import { cn } from "../../utils/cn";

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
      <table className={cn("w-full text-left text-sm", className)}>{children}</table>
    </div>
  );
}
export function Thead({ children }: { children: ReactNode }) {
  return <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{children}</thead>;
}
export function Tbody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{children}</tbody>;
}
export function Tr({ children, className }: { children: ReactNode; className?: string }) {
  return <tr className={cn("hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors", className)}>{children}</tr>;
}
export function Th({ children }: { children: ReactNode }) {
  return <th className="px-4 py-3 font-medium">{children}</th>;
}
export function Td({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 text-slate-700 dark:text-slate-200", className)}>{children}</td>;
}
