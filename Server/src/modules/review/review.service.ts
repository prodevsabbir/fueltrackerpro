import mongoose, { Types } from "mongoose";
import { ReviewModel } from "./review.models";
import { StationModel } from "../station/station.models";
import CustomError from "../../helpers/CustomError";

const createReview = async (data: any) => {
  const review = await ReviewModel.create(data);
  if (!review) throw new CustomError(400, "Review not created");
  
  // Update station rating/reviewsCount (simple logic for now)
  await StationModel.findByIdAndUpdate(data.stationId, {
    $inc: { reviewsCount: 1 }
  });

  return review;
};

const getReviewsByStation = async (stationId: string) => {
  return await ReviewModel.find({ 
    stationId: new Types.ObjectId(stationId) as any, 
    isDeleted: false 
  })
  .populate('userId', 'name points reputation')
  .sort({ createdAt: -1 as any });
};

const getAllReviews = async (query: any) => {
  const { page = 1, limit = 10, rating } = query;
  const skip = (Number(page) - 1) * Number(limit);
  
  let filter: any = { isDeleted: false };
  if (rating && rating !== "all") {
    filter.rating = Number(rating);
  }

  const [reviews, total] = await Promise.all([
    ReviewModel.find(filter)
      .populate("userId", "name email profileImage")
      .populate("stationId", "name location")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    ReviewModel.countDocuments(filter)
  ]);

  return {
    reviews,
    meta: {
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
      total
    }
  };
};

export const reviewService = {
  createReview,
  getReviewsByStation,
  getAllReviews
};
