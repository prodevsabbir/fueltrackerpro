import { z } from "zod";
import { role, status } from "./user.interface";

export const registerUserSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(16, "Password must be at most 16 characters"),
    role: z.enum(Object.values(role) as [string, ...string[]]).default(role.RIDER).optional(),
    vehicleType: z.string().optional(),
  })
  .strict();

export const verifyAccountSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    otp: z
      .string()
      .length(6, "OTP must be exactly 6 digits")
      .regex(/^\d{6}$/, "OTP must contain only numbers"),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(16, "Password must be at most 16 characters"),
    rememberMe: z.boolean().default(false).optional(),
  })
  .strict();

export const updateUserSchema = z
  .object({
    name: z.string().min(1, "Name cannot be empty").optional(),
    phone: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    status: z.enum(Object.values(status) as [string, ...string[]]).optional(),
    vehicleType: z.string().optional(),
  })
  .strict();

export const updateStatusSchema = z
  .object({
    status: z.enum(Object.values(status) as [string, ...string[]]).optional(),
  })
  .strict();

export const forgetPasswordSchema = z
  .object({
    email: z.string().email("Invalid email address"),
  })
  .strict();

export const verifyOtpSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    otp: z
      .string()
      .length(6, "OTP must be exactly 6 digits")
      .regex(/^\d{6}$/, "OTP must contain only numbers"),
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(16, "Password must be at most 16 characters"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(16, "Password must be at most 16 characters"),
  })
  .strict()
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(16, "Password must be at most 16 characters"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(16, "Password must be at most 16 characters"),
  })
  .strict()
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirm password do not match",
    path: ["confirmPassword"],
  });
