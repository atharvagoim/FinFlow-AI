import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { verifyAccessToken, JwtPayload } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Verifies the Bearer access token and attaches the decoded payload to
// req.user. Downstream role middleware and controllers rely on this.
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(AppError.unauthorized("Missing or malformed Authorization header"));
  }
  const token = header.split(" ")[1];
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(AppError.unauthorized("Invalid or expired access token"));
  }
}
