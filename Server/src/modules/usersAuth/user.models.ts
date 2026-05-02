import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import CustomError from "../../helpers/CustomError";
import config from "../../config";
import { IUser, role, status } from "./user.interface";

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: function (this: IUser): boolean {
        return this.provider === "local";
      },
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(role),
      default: role.RIDER,
    },
    profileImage: {
      public_id: String,
      secure_url: String,
      _id: false,
    },
    status: {
      type: String,
      enum: Object.values(status),
      default: status.ACTIVE,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    verificationOtp: {
      type: String,
      required: false,
    },
    verificationOtpExpire: {
      type: Date,
    },
    provider: {
      type: String,
      enum: ["local", "google", "apple"],
      default: "local",
    },
    providerId: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    refreshToken: {
      type: String,
    },
    resetPassword: {
      otp: {
        type: String,
      },
      otpExpire: {
        type: Date,
      },
      token: {
        type: String,
      },
      tokenExpire: {
        type: Date,
      },
    },
    rememberMe: {
      type: Boolean,
      default: false,
    },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [90.4125, 23.8103] } // [lng, lat]
    },
    // Rider specific info
    vehicleType: {
      type: String,
      required: false,
    },
    // Trust Metrics
    points: { type: Number, default: 0 },
    reputation: { 
      type: String, 
      enum: ['newbie', 'contributor', 'expert', 'elite', 'master'],
      default: 'newbie'
    },
    totalDiscoveries: { type: Number, default: 0 },
    rejectedDiscoveries: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ location: '2dsphere' });

// Pre-save hooks: removed next() as they are async
userSchema.pre<IUser>("save", async function () {
  if (this.isNew || this.isModified("email")) {
    const userModel = this.constructor as Model<IUser>;
    const existingUser = await userModel.findOne({ email: this.email });
    if (existingUser && existingUser._id.toString() !== this._id.toString()) {
      throw new CustomError(409, "Email already exists");
    }
  }
});

userSchema.pre<IUser>("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance methods
userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.updatePassword = async function (currentPassword: string, newPassword: string): Promise<boolean> {
  const isValid = await this.comparePassword(currentPassword);
  if (!isValid) throw new CustomError(401, "Current password is incorrect");
  
  const isMatch = await this.comparePassword(newPassword);
  if (isMatch) throw new CustomError(400, "New password must be different from current password");

  this.password = newPassword;
  return true;
};

userSchema.methods.createAccessToken = function () {
  return jwt.sign(
    { userId: this._id, email: this.email, role: this.role },
    config.jwt.accessTokenSecret as string,
    {
      expiresIn: this.rememberMe ? "30d" : (config.jwt.accessTokenExpires as any),
    },
  );
};

userSchema.methods.createRefreshToken = function () {
  return jwt.sign(
    { userId: this._id },
    config.jwt.refreshTokenSecret as string,
    {
      expiresIn: config.jwt.refreshTokenExpires as any,
    },
  );
};

userSchema.methods.generateResetPasswordToken = function () {
  return jwt.sign(
    { userId: this._id, email: this.email },
    config.passwordResetTokenSecret as string,
    {
      expiresIn: config.passwordResetTokenExpire as any,
    },
  );
};

export const userModel: Model<IUser> = mongoose.model<IUser>("User", userSchema);
