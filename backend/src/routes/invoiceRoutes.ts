import { Router } from "express";
import * as invoiceController from "../controllers/invoiceController";
import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/rbacMiddleware";
import { validate } from "../middlewares/validate";
import { createInvoiceSchema } from "../validators/invoiceValidators";

const router = Router();
router.use(authenticate);

router.get("/", invoiceController.list);
router.post("/", validate(createInvoiceSchema), invoiceController.create);
router.get("/:id", invoiceController.getOne);
router.put("/:id", invoiceController.update);
router.delete("/:id", authorize("admin", "finance_manager"), invoiceController.remove);
router.post("/:id/approve", authorize("admin", "finance_manager"), invoiceController.approve);
router.post("/:id/generate-pdf", invoiceController.generatePdf);

export default router;
