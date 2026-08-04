import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-950">
      <p className="font-display text-4xl font-bold text-slate-300">404</p>
      <p className="text-slate-500">Page not found</p>
      <Link to="/" className="text-brand-600 hover:underline">Go home</Link>
    </div>
  );
}
