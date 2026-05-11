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
  const { 
    page = 1, 
    limit = 10, 
    rating, 
    search, 
    isOverprice, 
    isVerified, 
    sortBy = 'latest', 
    lat, 
    lng 
  } = query;
  
  const skip = (Number(page) - 1) * Number(limit);
  const pLimit = Number(limit);

  let pipeline: any[] = [];

  // 1. Handle Nearest Logic (Starts from Station)
  if (sortBy === 'nearest' && lat && lng) {
    pipeline.push({
      $geoNear: {
        near: { type: "Point", coordinates: [Number(lng), Number(lat)] },
        distanceField: "distance",
        spherical: true,
        maxDistance: 100000, // 100km
        key: "location.geo"
      }
    });

    pipeline.push({
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "stationId",
        as: "review"
      }
    });

    pipeline.push({ $unwind: "$review" });

    pipeline.push({
      $project: {
        _id: "$review._id",
        stationId: {
          _id: "$_id",
          name: "$name",
          location: "$location",
          distance: "$distance"
        },
        userId: "$review.userId",
        userName: "$review.userName",
        comment: "$review.comment",
        rating: "$review.rating",
        isOverprice: "$review.isOverprice",
        reportedIssues: "$review.reportedIssues",
        isVerified: "$review.isVerified",
        upvotes: "$review.upvotes",
        downvotes: "$review.downvotes",
        createdAt: "$review.createdAt",
        isDeleted: "$review.isDeleted"
      }
    });
  } else {
    // 1. Standard Logic (Starts from Review)
    pipeline.push({ $match: { isDeleted: false } });
    
    pipeline.push({
      $lookup: {
        from: "stations",
        localField: "stationId",
        foreignField: "_id",
        as: "stationId"
      }
    });
    pipeline.push({ $unwind: "$stationId" });
  }

  // 2. Lookup User details
  pipeline.push({
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "userId"
    }
  });
  pipeline.push({ $unwind: "$userId" });

  // 3. Apply Filters
  const matchFilters: any = { isDeleted: false };
  if (rating && rating !== "all") matchFilters.rating = Number(rating);
  if (isOverprice === 'true' || isOverprice === true) matchFilters.isOverprice = true;
  if (isVerified === 'true' || isVerified === true) matchFilters.isVerified = true;
  
  if (search) {
    matchFilters.$or = [
      { "stationId.name": { $regex: search, $options: 'i' } },
      { "stationId.location.address": { $regex: search, $options: 'i' } },
      { "stationId.location.city": { $regex: search, $options: 'i' } },
      { "stationId.location.area": { $regex: search, $options: 'i' } },
      { "stationId.location.subArea": { $regex: search, $options: 'i' } },
      { "comment": { $regex: search, $options: 'i' } }
    ];
  }
  pipeline.push({ $match: matchFilters });

  // 4. Sorting
  if (sortBy === 'trust') {
    pipeline.push({
      $addFields: {
        trustScore: {
          $cond: {
            if: { $eq: [{ $add: [{ $size: { $ifNull: ["$upvotes", []] } }, { $size: { $ifNull: ["$downvotes", []] } }] }, 0] },
            then: 1,
            else: { $divide: [{ $size: "$upvotes" }, { $add: [{ $size: "$upvotes" }, { $size: "$downvotes" }] }] }
          }
        }
      }
    });
    pipeline.push({ $sort: { trustScore: -1, createdAt: -1 } });
  } else if (sortBy === 'nearest' && lat && lng) {
    pipeline.push({ $sort: { "stationId.distance": 1, createdAt: -1 } });
  } else {
    pipeline.push({ $sort: { createdAt: -1 } });
  }

  // 5. Final structure and pagination
  pipeline.push({
    $project: {
      "userId.password": 0,
      "userId.otp": 0,
      "userId.otpExpires": 0,
      "stationId.fuels": 0,
      "stationId.facilities": 0
    }
  });

  pipeline.push({
    $facet: {
      data: [{ $skip: skip }, { $limit: pLimit }],
      totalCount: [{ $count: "count" }]
    }
  });

  const result = (sortBy === 'nearest' && lat && lng) 
    ? await StationModel.aggregate(pipeline)
    : await ReviewModel.aggregate(pipeline);
  
  const reviews = result[0]?.data || [];
  const total = result[0]?.totalCount[0]?.count || 0;

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

const voteReview = async (reviewId: string, userId: string, type: 'up' | 'down') => {
  const review = await ReviewModel.findById(reviewId);
  if (!review) throw new CustomError(404, "Review not found");

  const userObjectId = new Types.ObjectId(userId);
  const alreadyUpvoted = review.upvotes.some(id => id.toString() === userId);
  const alreadyDownvoted = review.downvotes.some(id => id.toString() === userId);

  // Clear existing votes for this user
  review.upvotes = review.upvotes.filter(id => id.toString() !== userId);
  review.downvotes = review.downvotes.filter(id => id.toString() !== userId);

  // If clicking the same button, it acts as a toggle (remove vote)
  // If clicking different button, it switches the vote
  if (type === 'up' && !alreadyUpvoted) {
    review.upvotes.push(userObjectId);
  } else if (type === 'down' && !alreadyDownvoted) {
    review.downvotes.push(userObjectId);
  }

  await review.save();
  return await ReviewModel.findById(review._id)
    .populate("userId", "name email profileImage")
    .populate("stationId", "name location");
};

export const reviewService = {
  createReview,
  getReviewsByStation,
  getAllReviews,
  voteReview
};
