import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as paymentService from "../services/paymentService";

export const initiate = asyncHandler(async (req: Request, res: Response) => {
  const { invoiceId, provider, source } = req.body;
  const payment = await paymentService.initiatePayment(invoiceId, provider || "manual", source);
  res.status(201).json({ success: true, data: payment });
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const filter: Record<string, unknown> = {};
  if (req.query.status) filter.status = req.query.status;
  const payments = await paymentService.listPayments(filter);
  res.json({ success: true, data: payments });
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const payment = await paymentService.getPayment(req.params.id);
  res.json({ success: true, data: payment });
});

export const refund = asyncHandler(async (req: Request, res: Response) => {
  const payment = await paymentService.refundPayment(req.params.id, req.body.amount);
  res.json({ success: true, data: payment });
});
