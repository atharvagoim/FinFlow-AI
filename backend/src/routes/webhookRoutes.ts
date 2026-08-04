import { Router } from "express";
import * as webhookController from "../controllers/webhookController";

const router = Router();
// Intentionally unauthenticated (external providers won't have JWTs) — in
// production, verify a provider-specific signature header here instead.
router.post("/:workflowId", webhookController.receive);

export default router;
