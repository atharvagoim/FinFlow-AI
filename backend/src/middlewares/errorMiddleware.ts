import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";
import { env } from "../config/env";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    code: "NOT_FOUND",
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
}

// Centralized error handler. Keeps controllers free of try/catch boilerplate
// and guarantees a consistent JSON error shape across the whole API.
export function errorMiddleware(err: unknown, req: Request, res: Response, _next: NextFunction) {
  let statusCode = 500;
  let code = "INTERNAL_ERROR";
  let message = "Something went wrong";
  let details: unknown;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err instanceof Error) {
    message = err.message;
  }

  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} - ${message}`, { stack: (err as Error)?.stack });
  } else {
    logger.warn(`${req.method} ${req.originalUrl} - ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    code,
    message,
    details,
    ...(env.nodeEnv !== "production" && err instanceof Error ? { stack: err.stack } : {}),
  });
}
