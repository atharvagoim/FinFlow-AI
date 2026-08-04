import { Router } from "express";
import * as expenseController from "../controllers/expenseController";
import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/rbacMiddleware";

const router = Router();
router.use(authenticate);

router.get("/", expenseController.list);
router.post("/", expenseController.create);
router.post("/:id/approve", authorize("admin", "finance_manager"), expenseController.approve);

export default router;
