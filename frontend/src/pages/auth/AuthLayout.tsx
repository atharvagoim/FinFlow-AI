import { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 bg-grid-pattern bg-[size:32px_32px] px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="glass-panel w-full max-w-md rounded-2xl bg-white/80 dark:bg-slate-900/70 p-8"
      >
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-bold text-slate-800 dark:text-white">FinFlow AI</span>
        </div>
        <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">{title}</h1>
        <p className="mt-1 mb-6 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        {children}
      </motion.div>
    </div>
  );
}
