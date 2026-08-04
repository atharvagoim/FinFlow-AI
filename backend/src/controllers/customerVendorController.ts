import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { Customer } from "../models/Customer";
import { Vendor } from "../models/Vendor";

export const listCustomers = asyncHandler(async (_req: Request, res: Response) => {
  const customers = await Customer.find().sort({ createdAt: -1 });
  res.json({ success: true, data: customers });
});

export const createCustomer = asyncHandler(async (req: Request, res: Response) => {
  const customer = await Customer.create({ ...req.body, createdBy: req.user!.sub });
  res.status(201).json({ success: true, data: customer });
});

export const listVendors = asyncHandler(async (_req: Request, res: Response) => {
  const vendors = await Vendor.find().sort({ createdAt: -1 });
  res.json({ success: true, data: vendors });
});

export const createVendor = asyncHandler(async (req: Request, res: Response) => {
  const vendor = await Vendor.create({ ...req.body, createdBy: req.user!.sub });
  res.status(201).json({ success: true, data: vendor });
});
