import express from "express";
import { getWagons, createWagon, updateWagon, deleteWagon } from "../controllers/wagonController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.route("/")
  .get(authMiddleware, allowRoles("admin", "operator", "analyst"), getWagons)
  .post(authMiddleware, allowRoles("admin"), createWagon);

router.route("/:id")
  .put(authMiddleware, allowRoles("admin", "operator"), updateWagon)
  .delete(authMiddleware, allowRoles("admin"), deleteWagon);

export default router;
