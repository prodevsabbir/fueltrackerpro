import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import ApiResponse from "../../utils/apiResponse";
import { reviewService } from "./review.service";

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await reviewService.createReview({
    ...req.body,
    userId: (req as any).user?._id,
    userName: (req as any).user?.name || "Anonymous"
  });
  ApiResponse.sendSuccess(res, 201, "Review posted", review);
});

export const getStationReviews = asyncHandler(async (req: Request, res: Response) => {
  const reviews = await reviewService.getReviewsByStation(req.params.stationId as string);
  ApiResponse.sendSuccess(res, 200, "Reviews retrieved", reviews);
});

export const getAllReviews = asyncHandler(async (req: Request, res: Response) => {
  const { reviews, meta } = await reviewService.getAllReviews(req.query);
  ApiResponse.sendSuccess(res, 200, "All reviews retrieved", reviews, meta);
});

export const voteReview = asyncHandler(async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const { type } = req.body;
  const userId = (req as any).user?._id;
  const review = await reviewService.voteReview(reviewId as string, userId, type);
  ApiResponse.sendSuccess(res, 200, "Vote updated", review);
});
