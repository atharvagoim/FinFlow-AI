import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { env } from "./config/env";
import { globalRateLimiter } from "./middlewares/rateLimiter";
import { errorMiddleware, notFoundHandler } from "./middlewares/errorMiddleware";
import { logger } from "./utils/logger";

import authRoutes from "./routes/authRoutes";
import workflowRoutes from "./routes/workflowRoutes";
import aiRoutes from "./routes/aiRoutes";
import invoiceRoutes from "./routes/invoiceRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import expenseRoutes from "./routes/expenseRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import webhookRoutes from "./routes/webhookRoutes";
import adminRoutes from "./routes/adminRoutes";
import { customerRouter, vendorRouter } from "./routes/customerVendorRoutes";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev", { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use(globalRateLimiter);
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/health", (_req, res) => res.json({ success: true, status: "ok", timestamp: new Date().toISOString() }));

app.use("/api/auth", authRoutes);
app.use("/api/workflows", workflowRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/customers", customerRouter);
app.use("/api/vendors", vendorRouter);

app.use(notFoundHandler);
app.use(errorMiddleware);
