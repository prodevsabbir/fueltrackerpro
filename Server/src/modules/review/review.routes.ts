import express from "express";
import { createReview, getStationReviews, getAllReviews } from "./review.controller";
import { authGuard, optionalAuth } from "../../middleware/auth.middleware";

const router = express.Router();

router.post("/create", authGuard as any, createReview);
router.get("/get-by-station/:stationId", getStationReviews);
router.get("/all", optionalAuth as any, getAllReviews);

export const reviewRoute = router;
