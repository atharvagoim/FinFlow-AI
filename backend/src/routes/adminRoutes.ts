import { Router } from "express";
import * as adminController from "../controllers/adminController";
import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/rbacMiddleware";

const router = Router();
router.use(authenticate, authorize("admin"));

router.get("/users", adminController.listUsers);
router.patch("/users/:id/role", adminController.updateUserRole);
router.patch("/users/:id/status", adminController.deactivateUser);
router.get("/audit-logs", adminController.listAuditLogs);
router.get("/executions", adminController.listAllExecutions);

export default router;
