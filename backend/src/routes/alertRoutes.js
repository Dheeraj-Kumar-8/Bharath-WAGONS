import express from "express";
import {
  generateAlerts,
  getAlerts,
  getAlertStats,
  resolveAlert,
  dismissAlert,
} from "../controllers/alertController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

// Generate / sync alerts from wagon data (admin only)
router.post("/generate", authMiddleware, allowRoles("admin"), generateAlerts);

// Read alerts (admin + analyst)
router.get("/",      authMiddleware, allowRoles("admin", "analyst"), getAlerts);
router.get("/stats", authMiddleware, allowRoles("admin", "analyst"), getAlertStats);

// Mutate alert status
router.patch("/:id/resolve", authMiddleware, allowRoles("admin", "analyst"), resolveAlert);
router.delete("/:id",        authMiddleware, allowRoles("admin", "analyst"), dismissAlert);

export default router;
