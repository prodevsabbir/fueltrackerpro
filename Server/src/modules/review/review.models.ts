import { Schema, model, Types } from "mongoose";

export interface IReview {
  stationId: Types.ObjectId;
  userId: Types.ObjectId;
  userName: string;
  comment: string;
  rating: number;
  isOverprice: boolean;
  isVerified: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>({
  stationId: { type: Schema.Types.ObjectId, ref: "Station", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true },
  comment: { type: String, required: true },
  rating: { type: Number, default: 0 },
  isOverprice: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

export const ReviewModel = model<IReview>("Review", reviewSchema);
