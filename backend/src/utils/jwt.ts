import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type JwtPayload = {
  sub: string; // user id
  role: "admin" | "finance_manager" | "employee";
  email: string;
};

// @types/jsonwebtoken types `expiresIn` as a narrow `StringValue` union (from
// the `ms` package) rather than `string`, so our env-driven config value
// (e.g. "15m" from .env) needs an explicit cast — the runtime accepts any
// valid "ms"-style string regardless of what TS infers here.
export function signAccessToken(payload: JwtPayload): string {
  const options: jwt.SignOptions = {
    expiresIn: env.jwt.accessExpiresIn as jwt.SignOptions["expiresIn"],
  };
  return jwt.sign(payload, env.jwt.accessSecret, options);
}

export function signRefreshToken(payload: Pick<JwtPayload, "sub">): string {
  const options: jwt.SignOptions = {
    expiresIn: env.jwt.refreshExpiresIn as jwt.SignOptions["expiresIn"],
  };
  return jwt.sign(payload, env.jwt.refreshSecret, options);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwt.accessSecret) as JwtPayload;
}

export function verifyRefreshToken(token: string): { sub: string } {
  return jwt.verify(token, env.jwt.refreshSecret) as { sub: string };
}
