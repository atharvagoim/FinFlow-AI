import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "../../utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, label, error, id, ...props }, ref) => (
  <div className="w-full">
    {label && <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">{label}</label>}
    <input ref={ref} id={id} className={cn("input-base", error && "border-red-400 focus:ring-red-400/50", className)} {...props} />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
));
Input.displayName = "Input";
