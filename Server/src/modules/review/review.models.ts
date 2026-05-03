import { Schema, model, Types } from "mongoose";

export interface IReview {
  stationId: Types.ObjectId;
  userId: Types.ObjectId;
  userName: string;
  comment: string;
  rating: number;
  isOverprice: boolean;
  reportedIssues: string[];
  isVerified: boolean;
  isDeleted: boolean;
  upvotes: Types.ObjectId[];
  downvotes: Types.ObjectId[];
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
  reportedIssues: { type: [String], default: [] },
  isVerified: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  upvotes: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  downvotes: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }]
}, { timestamps: true });

export const ReviewModel = model<IReview>("Review", reviewSchema);
