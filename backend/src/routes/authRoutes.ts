import { Router } from "express";
import * as authController from "../controllers/authController";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/authMiddleware";
import { authRateLimiter } from "../middlewares/rateLimiter";
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/authValidators";

const router = Router();

router.post("/signup", authRateLimiter, validate(signupSchema), authController.signup);
router.get("/verify-email", authController.verifyEmail);
router.post("/verify-email", authController.verifyEmail);
router.post("/login", authRateLimiter, validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.post("/forgot-password", authRateLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);
router.get("/me", authenticate, authController.me);

export default router;
