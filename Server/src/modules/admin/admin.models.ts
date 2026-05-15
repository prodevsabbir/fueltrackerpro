import mongoose, { Schema } from "mongoose";
import { ISystemSettings } from "./admin.interface";

const systemSettingsSchema = new Schema<ISystemSettings>({
  appName: { type: String, default: "FuelTracker Pro" },
  supportEmail: { type: String, default: "support@fueltracker.com" },
  contactPhone: { type: String, default: "+880 1234-567890" },
  defaultCurrency: { type: String, default: "BDT" },
  maintenanceMode: { type: Boolean, default: false },
  allowRegistrations: { type: Boolean, default: true },
  requireEmailVerification: { type: Boolean, default: true },
  sessionTimeoutMinutes: { type: Number, default: 60 },
  maxFailedLoginAttempts: { type: Number, default: 5 },
  developerInfo: {
    name: { type: String, default: "Sabbir Hossain" },
    role: { type: String, default: "Full Stack Developer" },
    email: { type: String, default: "prodev.sabbir@gmail.com" },
    website: { type: String, default: "https://sabbirhossain.com" },
    github: { type: String, default: "https://github.com/prodevsabbir" },
    linkedin: { type: String, default: "https://linkedin.com/in/prodevsabbir" },
    description: { type: String, default: "Passionate about building scalable web applications and solving real-world problems through technology." },
    imageUrl: { type: String, default: "https://avatars.githubusercontent.com/u/85465545?v=4" }
  }
}, { timestamps: true });

export const SystemSettingsModel = mongoose.model<ISystemSettings>("SystemSettings", systemSettingsSchema);
