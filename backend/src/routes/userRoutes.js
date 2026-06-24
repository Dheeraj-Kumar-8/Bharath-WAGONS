import express from "express";
import { getUsers, createUser, updateUser, deleteUser } from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

// GET all users — admin only
router.get("/", authMiddleware, allowRoles("admin"), getUsers);

// POST create user — allow unauthenticated for access request submissions (pending activation)
// and admin-created accounts. Role is validated in the controller.
router.post("/", createUser);

// PUT / DELETE — admin only
router.route("/:id")
  .put(authMiddleware, allowRoles("admin"), updateUser)
  .delete(authMiddleware, allowRoles("admin"), deleteUser);

export default router;
