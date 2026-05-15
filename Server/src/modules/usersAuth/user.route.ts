import { Router } from "express";
import {
  registration,
  verifyAccount,
  login,
  updateStatus,
  updatePassword,
  updateUser,
  logout,
  forgetPassword,
  verifyOtpForgetPassword,
  resetPassword,
  generateAccessToken,
  loginWithGoogle,
  getalluser,
  getmyprofile,
  getSingleUser,
} from "./user.controller";
import { allowRole, authGuard } from "../../middleware/auth.middleware";
import { upload } from "../../middleware/multer.midleware";
import { validateRequest } from "../../middleware/validateRequest.middleware";
import {
  forgetPasswordSchema,
  loginSchema,
  registerUserSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  updateStatusSchema,
  updateUserSchema,
  verifyAccountSchema,
  verifyOtpSchema,
} from "./user.validation";
import {
  authLimiter,
  otpLimiter,
  resetPasswordLimiter,
} from "../../middleware/rateLimiter.middleware";

const router = Router();

router.post(
  "/register-user",
  authLimiter,
  validateRequest(registerUserSchema),
  registration,
);

router.post("/login", authLimiter, validateRequest(loginSchema), login);

router.get("/get-all-user", authGuard as any, allowRole("admin") as any, getalluser);

router.get("/get-single-user/:userId", authGuard as any, getSingleUser);

router.get("/get-my-profile", authGuard as any, getmyprofile);

router.patch(
  "/update-user",
  authGuard as any,
  upload.single("image"),
  validateRequest(updateUserSchema),
  updateUser,
);

router.patch(
  "/update-status/:userId",
  authGuard as any,
  allowRole("admin") as any,
  validateRequest(updateStatusSchema),
  updateStatus,
);

router.patch(
  "/update-password",
  authLimiter,
  authGuard as any,
  validateRequest(updatePasswordSchema),
  updatePassword,
);

router.post("/logout", authGuard as any, logout);

router.post(
  "/forget-password",
  resetPasswordLimiter,
  validateRequest(forgetPasswordSchema),
  forgetPassword,
);

router.post(
  "/verify-otp",
  otpLimiter,
  validateRequest(verifyOtpSchema),
  verifyOtpForgetPassword,
);

router.post(
  "/reset-password/:token",
  resetPasswordLimiter,
  validateRequest(resetPasswordSchema),
  resetPassword,
);

router
  .route("/verify-account")
  .post(otpLimiter, validateRequest(verifyAccountSchema), verifyAccount);

// token
router.post("/generate-access-token", generateAccessToken);

// google login
router.post("/login-with-google", loginWithGoogle);

export const userRoute = router;
