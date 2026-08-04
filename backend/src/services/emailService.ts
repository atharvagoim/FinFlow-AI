import nodemailer from "nodemailer";
import { env } from "../config/env";
import { logger } from "../utils/logger";

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.port === 465,
  auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Centralized email sender. In dev without SMTP creds configured, we log
// instead of throwing so the rest of the app flow (signup, etc.) isn't blocked.
export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  if (!env.smtp.user) {
    logger.info(`[emailService] SMTP not configured. Would send to ${to}: ${subject}`);
    return;
  }
  try {
    await transporter.sendMail({ from: env.smtp.from, to, subject, html });
  } catch (err) {
    logger.error(`[emailService] Failed to send email to ${to}: ${(err as Error).message}`);
  }
}

export function verificationEmailTemplate(name: string, link: string) {
  return `<div style="font-family:sans-serif;max-width:480px;margin:auto">
    <h2>Welcome to FinFlow AI, ${name}</h2>
    <p>Please verify your email to activate your account.</p>
    <a href="${link}" style="display:inline-block;padding:12px 20px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none">Verify Email</a>
  </div>`;
}

export function passwordResetEmailTemplate(name: string, link: string) {
  return `<div style="font-family:sans-serif;max-width:480px;margin:auto">
    <h2>Reset your password, ${name}</h2>
    <p>Click below to reset your password. This link expires in 1 hour.</p>
    <a href="${link}" style="display:inline-block;padding:12px 20px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none">Reset Password</a>
  </div>`;
}
