import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User, IUser } from "../models/User";
import { RefreshToken } from "../models/RefreshToken";
import { AppError } from "../utils/AppError";
import { env } from "../config/env";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { sendEmail, verificationEmailTemplate, passwordResetEmailTemplate } from "./emailService";

export async function registerUser(name: string, email: string, password: string, role?: string) {
  const existing = await User.findOne({ email });
  if (existing) throw AppError.conflict("An account with this email already exists");

  const passwordHash = await bcrypt.hash(password, env.security.bcryptSaltRounds);
  const emailVerificationToken = crypto.randomBytes(32).toString("hex");

  const user = await User.create({
    name,
    email,
    passwordHash,
    role: role || "employee",
    emailVerificationToken,
    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  const link = `${env.clientUrl}/verify-email?token=${emailVerificationToken}`;
  await sendEmail({ to: email, subject: "Verify your FinFlow AI account", html: verificationEmailTemplate(name, link) });

  return user;
}

export async function verifyEmailToken(token: string) {
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: new Date() },
  }).select("+emailVerificationToken +emailVerificationExpires");

  if (!user) throw AppError.badRequest("Invalid or expired verification token");

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();
  return user;
}

export async function authenticateUser(email: string, password: string, ip?: string) {
  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user || !user.isActive) throw AppError.unauthorized("Invalid credentials");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw AppError.unauthorized("Invalid credentials");

  return issueTokenPair(user, ip);
}

export async function issueTokenPair(user: IUser, ip?: string) {
  const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role, email: user.email });
  const refreshToken = signRefreshToken({ sub: user._id.toString() });

  await RefreshToken.create({
    user: user._id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdByIp: ip,
  });

  return { accessToken, refreshToken, user };
}

// Rotates refresh tokens: the old one is revoked and a new pair issued.
// This limits the blast radius if a refresh token is ever leaked.
export async function refreshTokens(oldToken: string, ip?: string) {
  let decoded: { sub: string };
  try {
    decoded = verifyRefreshToken(oldToken);
  } catch {
    throw AppError.unauthorized("Invalid refresh token");
  }

  const stored = await RefreshToken.findOne({ token: oldToken, revoked: false });
  if (!stored || stored.expiresAt < new Date()) {
    throw AppError.unauthorized("Refresh token expired or revoked");
  }

  const user = await User.findById(decoded.sub);
  if (!user || !user.isActive) throw AppError.unauthorized("User not found or inactive");

  stored.revoked = true;
  await stored.save();

  return issueTokenPair(user, ip);
}

export async function revokeRefreshToken(token: string) {
  await RefreshToken.updateOne({ token }, { revoked: true });
}

export async function requestPasswordReset(email: string) {
  const user = await User.findOne({ email });
  if (!user) return; // Do not leak whether the email exists.

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  const link = `${env.clientUrl}/reset-password?token=${resetToken}`;
  await sendEmail({ to: email, subject: "Reset your FinFlow AI password", html: passwordResetEmailTemplate(user.name, link) });
}

export async function resetPassword(token: string, newPassword: string) {
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: new Date() },
  }).select("+passwordResetToken +passwordResetExpires");

  if (!user) throw AppError.badRequest("Invalid or expired reset token");

  user.passwordHash = await bcrypt.hash(newPassword, env.security.bcryptSaltRounds);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
}
