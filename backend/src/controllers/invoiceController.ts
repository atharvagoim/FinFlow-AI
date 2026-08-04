import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as invoiceService from "../services/invoiceService";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const invoice = await invoiceService.createInvoice(req.user!.sub, req.body);
  res.status(201).json({ success: true, data: invoice });
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const filter: Record<string, unknown> = {};
  if (req.query.status) filter.status = req.query.status;
  const invoices = await invoiceService.listInvoices(filter);
  res.json({ success: true, data: invoices });
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const invoice = await invoiceService.getInvoice(req.params.id);
  res.json({ success: true, data: invoice });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const invoice = await invoiceService.updateInvoice(req.params.id, req.body);
  res.json({ success: true, data: invoice });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await invoiceService.deleteInvoice(req.params.id);
  res.json({ success: true, message: "Invoice deleted" });
});

export const approve = asyncHandler(async (req: Request, res: Response) => {
  const invoice = await invoiceService.approveInvoice(req.params.id, req.user!.sub);
  res.json({ success: true, data: invoice });
});

export const generatePdf = asyncHandler(async (req: Request, res: Response) => {
  const invoice = await invoiceService.generatePdfForInvoice(req.params.id);
  res.json({ success: true, data: invoice });
});
