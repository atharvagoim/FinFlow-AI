import { Moon, Sun, LogOut, Bell } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

export function Topbar({ title }: { title: string }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-lg px-6 py-4">
      <h1 className="font-display text-xl font-bold text-slate-800 dark:text-white">{title}</h1>
      <div className="flex items-center gap-3">
        <button onClick={toggleTheme} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300">
          {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </button>
        <button className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300">
          <Bell className="h-4.5 w-4.5" />
        </button>
        <div className="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-700" />
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="hidden sm:block text-sm">
            <p className="font-medium text-slate-700 dark:text-slate-200 leading-tight">{user?.name}</p>
            <p className="text-xs capitalize text-slate-400">{user?.role?.replace("_", " ")}</p>
          </div>
        </div>
        <button onClick={logout} title="Log out" className="rounded-xl p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10">
          <LogOut className="h-4.5 w-4.5" />
        </button>
      </div>
    </header>
  );
}
