import { Router } from "express";
import * as c from "../controllers/customerVendorController";
import { authenticate } from "../middlewares/authMiddleware";

export const customerRouter = Router();
customerRouter.use(authenticate);
customerRouter.get("/", c.listCustomers);
customerRouter.post("/", c.createCustomer);

export const vendorRouter = Router();
vendorRouter.use(authenticate);
vendorRouter.get("/", c.listVendors);
vendorRouter.post("/", c.createVendor);
