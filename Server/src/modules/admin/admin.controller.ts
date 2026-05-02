import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import ApiResponse from "../../utils/apiResponse";
import { adminService } from "./admin.service";

export const getSettings = asyncHandler(async (req: Request, res: Response) => {
  const settings = await adminService.getSettings();
  ApiResponse.sendSuccess(res, 200, "System settings fetched", settings);
});

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const settings = await adminService.updateSettings(req.body);
  ApiResponse.sendSuccess(res, 200, "System settings updated", settings);
});

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await adminService.getStats();
  ApiResponse.sendSuccess(res, 200, "Dashboard stats fetched", stats);
});

export const requestDangerOtp = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as any;
  const result = await adminService.requestDangerOtp(user.id || user._id);
  ApiResponse.sendSuccess(res, 200, result.message, null);
});

export const verifyDangerAction = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as any;
  const { otp, actionType } = req.body;
  const result = await adminService.verifyDangerAction(user.id || user._id, otp, actionType);
  ApiResponse.sendSuccess(res, 200, result.message, null);
});
