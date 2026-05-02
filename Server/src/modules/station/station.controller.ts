import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import ApiResponse from "../../utils/apiResponse";
import { stationService } from "./station.service";

export const createStation = asyncHandler(async (req: Request, res: Response) => {
  if (req.body.location && typeof req.body.location === 'string') req.body.location = JSON.parse(req.body.location);
  if (req.body.fuels && typeof req.body.fuels === 'string') req.body.fuels = JSON.parse(req.body.fuels);
  
  const stationData = { ...req.body };
  
  // Security & Audit: Track who created this
  if (req.user) {
    stationData.createdBy = req.user._id;
    stationData.creatorRole = req.user.role;
    
    // Strict Verification: Only ADMIN can auto-verify. Riders and Users need approval.
    if (req.user.role === 'admin') {
      stationData.verified = req.body.verified !== undefined ? req.body.verified : true;
    } else {
      stationData.verified = false;
    }
  }

  const station = await stationService.createStation(stationData, req.file);
  ApiResponse.sendSuccess(res, 201, "Station created", station);
});

export const getAllStations = asyncHandler(async (req: Request, res: Response) => {
  const isAdmin = req.user?.role === 'admin';
  const stations = await stationService.getAllStations(req.query, isAdmin);
  ApiResponse.sendSuccess(res, 200, "Stations retrieved", stations);
});

import mongoose from "mongoose";

export const getStationById = asyncHandler(async (req: Request, res: Response) => {
  const { stationId } = req.params;

  //  SECURITY: Prevent 'Cast Error' for demo IDs like 'st_001'
  if (!mongoose.Types.ObjectId.isValid(stationId as string )) {
    return ApiResponse.sendError(res, 404, "Station not found (Invalid ID format)");
  }

  const station = await stationService.getStationById(stationId as string);
  ApiResponse.sendSuccess(res, 200, "Station retrieved", station);
});

export const updateStation = asyncHandler(async (req: Request, res: Response) => {
  if (req.body.location && typeof req.body.location === 'string') req.body.location = JSON.parse(req.body.location);
  if (req.body.fuels && typeof req.body.fuels === 'string') req.body.fuels = JSON.parse(req.body.fuels);

  const station = await stationService.updateStation(req.params.stationId as string, req.body, req.file);
  ApiResponse.sendSuccess(res, 200, "Station updated", station);
});

export const deleteStation = asyncHandler(async (req: Request, res: Response) => {
  await stationService.deleteStation(req.params.stationId as string);
  ApiResponse.sendSuccess(res, 200, "Station deleted", null);
});

export const getNearbyStations = asyncHandler(async (req: Request, res: Response) => {
  const { lat, lng, radius } = req.query;
  if (!lat || !lng) {
    return ApiResponse.sendError(res, 400, "Latitude and Longitude are required");
  }
  const isAdmin = req.user?.role === 'admin';
  const stations = await stationService.getNearbyStations(
    Number(lat), 
    Number(lng), 
    radius ? Number(radius) : 10,
    req.user
  );
  ApiResponse.sendSuccess(res, 200, "Nearby stations retrieved", stations);
});
