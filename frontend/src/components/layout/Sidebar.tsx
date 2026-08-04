import { NavLink } from "react-router-dom";
import { LayoutDashboard, GitBranch, FileText, Wallet, Receipt, Users, Settings, Sparkles, Shield } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../utils/cn";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "finance_manager", "employee"] },
  { to: "/workflows", label: "Workflow Builder", icon: GitBranch, roles: ["admin", "finance_manager"] },
  { to: "/invoices", label: "Invoices", icon: FileText, roles: ["admin", "finance_manager", "employee"] },
  { to: "/payments", label: "Payments", icon: Wallet, roles: ["admin", "finance_manager"] },
  { to: "/expenses", label: "Expenses", icon: Receipt, roles: ["admin", "finance_manager", "employee"] },
  { to: "/admin", label: "Admin Panel", icon: Shield, roles: ["admin"] },
];

export function Sidebar() {
  const { user } = useAuth();
  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-slate-200/70 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg px-4 py-6">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md">
          <Sparkles className="h-5 w-5" />
        </div>
        <span className="font-display text-lg font-bold text-slate-800 dark:text-white">FinFlow AI</span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems
          .filter((item) => !user || item.roles.includes(user.role))
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-600 text-white shadow-md shadow-brand-600/25"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                )
              }
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </NavLink>
          ))}
      </nav>

      <NavLink to="/settings" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
        <Settings className="h-4.5 w-4.5" /> Settings
      </NavLink>
    </aside>
  );
}
