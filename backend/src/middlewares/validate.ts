import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { AppError } from "../utils/AppError";

// Generic Zod-based request validator. Pass a schema shaped like
// { body, params, query } and it validates + coerces req in place.
export const validate =
  (schema: AnyZodObject) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse({ body: req.body, params: req.params, query: req.query });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(AppError.badRequest("Validation failed", err.flatten()));
      }
      next(err);
    }
  };
