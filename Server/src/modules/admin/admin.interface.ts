import { Document } from "mongoose";

export interface ISystemSettings extends Document {
  appName: string;
  supportEmail: string;
  contactPhone: string;
  defaultCurrency: string;
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  requireEmailVerification: boolean;
  sessionTimeoutMinutes: number;
  maxFailedLoginAttempts: number;
  developerInfo: {
    name: string;
    role: string;
    email: string;
    website: string;
    github: string;
    linkedin: string;
    description: string;
    imageUrl?: string;
  };
}
