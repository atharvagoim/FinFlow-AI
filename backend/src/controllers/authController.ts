import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as authService from "../services/authService";
import { AppError } from "../utils/AppError";

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  const user = await authService.registerUser(name, email, password, role);
  res.status(201).json({
    success: true,
    message: "Account created. Check your email to verify your account.",
    data: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const token = (req.query.token as string) || req.body.token;
  if (!token) throw AppError.badRequest("Missing verification token");
  await authService.verifyEmailToken(token);
  res.json({ success: true, message: "Email verified successfully" });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { accessToken, refreshToken, user } = await authService.authenticateUser(email, password, req.ip);
  res.json({
    success: true,
    data: {
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isEmailVerified: user.isEmailVerified },
    },
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw AppError.badRequest("refreshToken is required");
  const tokens = await authService.refreshTokens(refreshToken, req.ip);
  res.json({
    success: true,
    data: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (refreshToken) await authService.revokeRefreshToken(refreshToken);
  res.json({ success: true, message: "Logged out" });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.requestPasswordReset(req.body.email);
  res.json({ success: true, message: "If that email exists, a reset link has been sent." });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  await authService.resetPassword(token, password);
  res.json({ success: true, message: "Password reset successfully" });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: req.user });
});
