import { clsx, ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Standard shadcn-style class combiner: merges conditional clsx classes and
// resolves conflicting Tailwind utilities (e.g. "p-2 p-4" -> "p-4").
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
