import { Router } from "express";
import * as dashboardController from "../controllers/dashboardController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();
router.use(authenticate);
router.get("/summary", dashboardController.getSummary);

export default router;
