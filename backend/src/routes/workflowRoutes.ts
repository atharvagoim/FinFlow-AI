import { Router } from "express";
import * as workflowController from "../controllers/workflowController";
import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/rbacMiddleware";
import { validate } from "../middlewares/validate";
import { saveWorkflowSchema, generateWorkflowSchema, triggerWorkflowSchema } from "../validators/workflowValidators";

const router = Router();
router.use(authenticate);

router.get("/", workflowController.list);
router.post("/", validate(saveWorkflowSchema), workflowController.create);
router.post("/generate", validate(generateWorkflowSchema), workflowController.generateFromPrompt);
router.get("/executions", workflowController.executions);
router.get("/executions/:id", workflowController.executionDetail);
router.get("/:id", workflowController.getOne);
router.put("/:id", validate(saveWorkflowSchema), workflowController.update);
router.delete("/:id", authorize("admin", "finance_manager"), workflowController.remove);
router.post("/:id/trigger", validate(triggerWorkflowSchema), workflowController.trigger);

export default router;
