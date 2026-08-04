import { Router } from "express";
import * as aiController from "../controllers/aiController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();
router.use(authenticate);

router.post("/categorize-expense", aiController.categorizeExpense);
router.post("/extract-invoice", aiController.extractInvoiceInfo);
router.post("/summarize-invoice", aiController.summarizeInvoice);
router.post("/payment-reminder", aiController.generatePaymentReminder);
router.post("/classify-email", aiController.classifyEmail);
router.post("/detect-duplicate-invoice", aiController.detectDuplicateInvoice);
router.post("/detect-fraud", aiController.detectFraud);
router.post("/suggest-approval", aiController.suggestApproval);
router.post("/generate-report", aiController.generateReport);
router.post("/chat", aiController.chat);

export default router;
