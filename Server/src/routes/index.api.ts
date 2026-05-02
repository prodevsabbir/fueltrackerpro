import express from "express";
const router = express.Router();

import { userRoute } from "../modules/usersAuth/user.route";
import { stationRoute } from "../modules/station/station.routes";
import { reviewRoute } from "../modules/review/review.routes";
import adminRoute from "../modules/admin/admin.routes";
import { maintenanceMiddleware } from "../middlewares/maintenance";

// Global Maintenance Check
router.use(maintenanceMiddleware);

router.use("/user", userRoute);
router.use("/station", stationRoute);
router.use("/review", reviewRoute);
router.use("/admin", adminRoute);

export default router;
