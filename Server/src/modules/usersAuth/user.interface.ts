import { Document, Types } from "mongoose";

export enum role {
  ADMIN = "admin",
  RIDER = "rider",
  OWNER = "owner",
}

export type AuthProvider = "local" | "google" | "kakao" | "apple";

export enum status {
  ACTIVE = "active",
  INACTIVE = "inactive",
  BLOCKED = "blocked",
  BANNED = "banned",
}

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: role;
  profileImage?: {
    public_id: string;
    secure_url: string;
  };
  status: status;
  city?: string;
  country?: string;
  isVerified: boolean;
  verificationOtp: string | null;
  verificationOtpExpire: Date | null;
  provider: AuthProvider;
  providerId?: string;
  refreshToken: string | null;
  resetPassword: {
    otp: string | null;
    otpExpire: Date | null;
    token: string | null;
    tokenExpire: Date | null;
  };
  location: {
    type: string;
    coordinates: [number, number];
  };
  rememberMe: boolean;
  lastLogin: Date;
  // Rider specific info
  vehicleType?: string;
  // Trust Metrics
  points: number;
  reputation: 'newbie' | 'contributor' | 'expert' | 'elite' | 'master';
  totalDiscoveries: number;
  rejectedDiscoveries: number;
  
  comparePassword: (password: string) => Promise<boolean>;
  createAccessToken: () => string;
  createRefreshToken: () => string;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  generateResetPasswordToken: () => string;
}

export interface UpdateUserPayload {
  name?: string;
  phone?: string;
  status?: status;
  city?: string;
  country?: string;
}
