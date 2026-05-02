import { StationModel } from "./station.models";
import { userModel } from "../usersAuth/user.models";
import { ICreateStation } from "./station.interface";
import CustomError from "../../helpers/CustomError";
import { uploadCloudinary, deleteCloudinary } from "../../helpers/cloudinary";
import { getIo } from "../../socket/server";
import { paginationHelper } from "../../utils/pagination";

const createStation = async (data: any, image?: any) => {
  const existingStation = await StationModel.findOne({ 
    name: { $regex: new RegExp(`^${data.name}$`, 'i') }, 
    isDeleted: false 
  });
  
  if (existingStation) {
    throw new CustomError(400, `A station named "${data.name}" already exists in our network.`);
  }

  if (image) {
    const result = await uploadCloudinary(image.path);
    data.image = result;
  }
  
  // Ensure GeoJSON is set
  if (data.location?.coordinates) {
    data.location.geo = {
      type: "Point",
      coordinates: [data.location.coordinates.lng, data.location.coordinates.lat]
    };
  }

  // Admin creations are pre-approved
  if (data.creatorRole === 'admin') {
    data.verified = true;
    data.approvalStatus = 'approved';
  } else {
    data.approvalStatus = 'pending';
  }

  const station = await StationModel.create(data);
  if (!station) throw new CustomError(400, "Station not created");

  // 🛰️ REAL-TIME BROADCAST: Notify all admins and clients of new station
  try {
    const io = getIo();
    io.emit("station_created", station);
    io.emit("admin_stats_update");
  } catch (err) {
    console.error("Socket emit failed in createStation", err);
  }

  return station;
};

const getAllStations = async (query: any, isAdmin: boolean = false) => {
  const { page: pagebody, limit: limitbody, search, status, category, sortBy, verified, approvalStatus, fuelType, lat, lng } = query;
  const { page, limit, skip } = paginationHelper(pagebody, limitbody);
  
  let filter: any = { isDeleted: false };

  // 🛰️ PROXIMITY INTELLIGENCE: Filter by nearest location if lat/lng provided
  if (lat && lng) {
    filter["location.geo"] = {
      $geoWithin: {
        $centerSphere: [
          [Number(lng), Number(lat)],
          50 / 6378.1 // 50km radius in radians
        ]
      }
    };
  }
  
  // Privacy Logic: Public users only see approved stations
  if (!isAdmin) {
    filter.approvalStatus = 'approved';
  } else {
    if (approvalStatus && approvalStatus !== 'all') {
      filter.approvalStatus = approvalStatus;
    } else if (verified !== undefined) {
      filter.verified = verified === 'true';
    }
  }

  // Fuel Type Filter
  if (fuelType && fuelType !== 'all') {
    filter['fuels.type'] = { $regex: new RegExp(`^${fuelType}$`, 'i') };
  }
  
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { "location.address": { $regex: search, $options: "i" } },
      { "location.subArea": { $regex: search, $options: "i" } }
    ];
  }
  
  if (status && status !== "all") {
    filter.status = status;
  }
  
  if (category && category !== "all") {
    filter.primaryCategory = { $regex: new RegExp(`^${category}$`, 'i') };
  }
  
  let sort: any = {};
  if (sortBy === "rating") sort.rating = -1;
  else if (sortBy === "price-low") sort["fuels.price"] = 1;
  else if (sortBy === "price-high") sort["fuels.price"] = -1;
  else sort.createdAt = -1;

  const [stations, total] = await Promise.all([
    StationModel.find(filter).sort(sort).skip(skip).limit(Number(limit)).populate('createdBy', 'name points reputation totalDiscoveries rejectedDiscoveries'),
    StationModel.countDocuments(filter)
  ]);

  return {
    stations,
    meta: {
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
      total
    }
  };
};

const getStationById = async (id: string) => {
  const station = await StationModel.findOne({ _id: id, isDeleted: false }).populate('createdBy', 'name points reputation totalDiscoveries rejectedDiscoveries');
  if (!station) throw new CustomError(404, "Station not found");
  return station;
};

const updateStation = async (id: string, data: any, image?: any) => {
  const existingStation = await StationModel.findOne({ _id: id, isDeleted: false });
  if (!existingStation) throw new CustomError(404, "Station not found");

  // Prevent duplicate names on update
  if (data.name && data.name !== existingStation.name) {
    const duplicate = await StationModel.findOne({ 
      name: { $regex: new RegExp(`^${data.name}$`, 'i') }, 
      isDeleted: false,
      _id: { $ne: id }
    });
    if (duplicate) {
      throw new CustomError(400, `Another station named "${data.name}" already exists.`);
    }
  }

  if (image) {
    if (existingStation.image?.public_id) {
      await deleteCloudinary(existingStation.image.public_id);
    }
    const result = await uploadCloudinary(image.path);
    data.image = result;
  }

  // Update GeoJSON if coordinates changed
  if (data.location?.coordinates) {
    data.location.geo = {
      type: "Point",
      coordinates: [data.location.coordinates.lng, data.location.coordinates.lat]
    };
  }

  // Sync approvalStatus with verification/rejection flags
  let isJustApproved = false;
  let isJustRejected = false;

  if (data.verified === true || data.approvalStatus === 'approved') {
    if (existingStation.approvalStatus !== 'approved') isJustApproved = true;
    data.approvalStatus = 'approved';
    data.verified = true;
    data.rejected = false;
  } else if (data.rejected === true || data.approvalStatus === 'rejected') {
    if (existingStation.approvalStatus !== 'rejected') isJustRejected = true;
    data.approvalStatus = 'rejected';
    data.verified = false;
    data.rejected = true;
  }

  const station = await StationModel.findOneAndUpdate(
    { _id: id },
    { $set: data, lastUpdated: new Date() },
    { new: true }
  ).populate('createdBy', 'name points reputation totalDiscoveries rejectedDiscoveries');

  if (!station) throw new CustomError(404, "Station not found");

  // ── TRUST ENGINE: Update Contributor Reputation ──
  if (station.createdBy && (isJustApproved || isJustRejected)) {
    const creator = await userModel.findById(station.createdBy._id);
    if (creator) {
      if (isJustApproved) {
        creator.points += 50;
        creator.totalDiscoveries += 1;
        
        // Reputation Levels
        if (creator.points >= 1000) creator.reputation = 'master';
        else if (creator.points >= 500) creator.reputation = 'elite';
        else if (creator.points >= 200) creator.reputation = 'expert';
        else if (creator.points >= 50) creator.reputation = 'contributor';
      } else if (isJustRejected) {
        creator.rejectedDiscoveries += 1;
        // Optionally penalize points if fraud detected
        if (creator.points >= 10) creator.points -= 10;
      }
      await creator.save();
    }
  }

  // Broadcast real-time updates & notifications
  try {
    const io = getIo();
    io.emit("station_updated", station);
    io.emit("admin_stats_update");

    if (isJustApproved) {
      io.to(station.createdBy?._id?.toString()).emit("notification", {
        type: "SUCCESS",
        title: "Station Verified!",
        message: `Congratulations! Your discovery "${station.name}" is now verified and live. You earned 50 reputation points!`
      });
    }

    if (isJustRejected) {
       io.to(station.createdBy?._id?.toString()).emit("notification", {
        type: "ERROR",
        title: "Station Rejected",
        message: `Sorry, your discovery "${station.name}" could not be verified. Please ensure details are accurate.`
      });
    }
  } catch (err) {
    console.error("Socket notification failed", err);
  }

  return station;
};

const deleteStation = async (id: string) => {
  const station = await StationModel.findByIdAndUpdate(id, { isDeleted: true });
  if (!station) throw new CustomError(404, "Station not found");
  return station;
};

const getNearbyStations = async (lat: number, lng: number, radiusKm: number = 10, user?: any) => {
  // ── MIGRATION: Auto-fix legacy stations missing the 'geo' field ──
  const legacyStations = await StationModel.find({ 
    "location.geo": { $exists: false },
    isDeleted: false 
  });
  
  if (legacyStations.length > 0) {
    for (const station of legacyStations) {
      if (station.location?.coordinates) {
        await StationModel.updateOne(
          { _id: station._id },
          { 
            $set: { 
              "location.geo": {
                type: "Point",
                coordinates: [station.location.coordinates.lng, station.location.coordinates.lat]
              }
            } 
          }
        );
      }
    }
  }

  const filter: any = {
    isDeleted: false,
    "location.geo": {
      $nearSphere: {
        $geometry: {
          type: "Point",
          coordinates: [lng, lat]
        },
        $maxDistance: radiusKm * 1000
      }
    }
  };

  // Public users only see verified. Admins see everything.
  const isAdmin = user?.role === 'admin';
  if (!isAdmin) {
    filter.verified = true;
  }

  const stations = await StationModel.find(filter).populate('createdBy', 'name');
  return stations;
};

export const stationService = {
  createStation,
  getAllStations,
  getStationById,
  updateStation,
  deleteStation,
  getNearbyStations
};
