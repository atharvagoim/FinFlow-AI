import { Router } from "express";
import * as paymentController from "../controllers/paymentController";
import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/rbacMiddleware";

const router = Router();
router.use(authenticate);

router.get("/", paymentController.list);
router.post("/", paymentController.initiate);
router.get("/:id", paymentController.getOne);
router.post("/:id/refund", authorize("admin", "finance_manager"), paymentController.refund);

export default router;
