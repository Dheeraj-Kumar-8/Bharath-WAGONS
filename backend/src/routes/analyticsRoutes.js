import express from "express";
import { getAnalytics, createAnalytic, deleteAnalytic } from "../controllers/analyticsController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.route("/")
  .get(authMiddleware, allowRoles("admin", "analyst"), getAnalytics)
  .post(authMiddleware, allowRoles("admin"), createAnalytic);

router.route("/:id")
  .delete(authMiddleware, allowRoles("admin"), deleteAnalytic);

export default router;
