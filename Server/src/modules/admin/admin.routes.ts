import { Router } from "express";
import { getSettings, updateSettings, getStats, requestDangerOtp, verifyDangerAction } from "./admin.controller";
import { authGuard } from "../../middleware/auth.middleware";
import { permission } from "../../middleware/permission.middleware";

const router = Router();

// Ensure all routes are protected and admin-only
router.use(authGuard, permission(["admin"]));

router.get("/settings", getSettings);
router.patch("/settings", updateSettings);
router.get("/stats", getStats);

router.post("/danger/request-otp", requestDangerOtp);
router.post("/danger/verify-action", verifyDangerAction);

export default router;
