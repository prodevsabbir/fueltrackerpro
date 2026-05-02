import { Request, Response, NextFunction } from "express";
import { SystemSettingsModel } from "../modules/admin/admin.models";
import CustomError from "../helpers/CustomError";
import jwt from "jsonwebtoken";

export const maintenanceMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if maintenance mode is on
    const settings = await SystemSettingsModel.findOne();
    if (!settings || !settings.maintenanceMode) {
      return next();
    }

    // Allow admin routes and auth routes so admins can still log in
    const path = req.originalUrl;
    if (path.includes("/api/v1/user/login") || path.includes("/api/v1/user/refresh-token") || path.includes("/api/v1/admin")) {
      return next();
    }

    // Try to decode token to see if user is an admin
    let isAdmin = false;
    const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as any;
        if (decoded && decoded.role === "admin") {
          isAdmin = true;
        }
      } catch (err) {
        // Token invalid, ignore
      }
    }

    if (isAdmin) {
      return next();
    }

    // Reject everyone else
    throw new CustomError(503, "System is under maintenance. Please try again later.");
  } catch (error) {
    next(error);
  }
};
