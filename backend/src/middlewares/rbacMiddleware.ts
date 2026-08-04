import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export type Role = "admin" | "finance_manager" | "employee";

// Restricts a route to a set of roles. Must run after `authenticate`.
// Usage: router.post("/", authenticate, authorize("admin", "finance_manager"), handler)
export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(AppError.unauthorized());
    if (!allowedRoles.includes(req.user.role)) {
      return next(AppError.forbidden(`Requires one of roles: ${allowedRoles.join(", ")}`));
    }
    next();
  };
}
