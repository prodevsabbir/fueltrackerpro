import express from "express";
import { createStation, deleteStation, getAllStations, getNearbyStations, getStationById, updateStation } from "./station.controller";

import { authGuard, allowRole, optionalAuth } from "../../middleware/auth.middleware";
import { role } from "../usersAuth/user.interface";
import { upload } from "../../middleware/multer.midleware";

const router = express.Router();

router.post("/create", authGuard, allowRole(role.ADMIN, role.RIDER, role.OWNER), upload.single("image"), createStation);
router.get("/nearby", optionalAuth, getNearbyStations);
router.get("/get-all", optionalAuth, getAllStations);
router.get("/get-station-by-id/:stationId", getStationById);
router.patch("/update-station-by-id/:stationId", authGuard, allowRole(role.ADMIN), upload.single("image"), updateStation);
router.delete("/delete-station-by-id/:stationId", authGuard, allowRole(role.ADMIN), deleteStation);

export const stationRoute = router;
