import express from "express";
import { getUsers, getUserById, createUser, updateUser, updateUserRole, updateUserStatus, deleteUser } from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

// GET all users — admin only
router.get("/", authMiddleware, allowRoles("admin"), getUsers);

// POST create user — allow unauthenticated for access request submissions (pending activation)
// and admin-created accounts. Role is validated in the controller.
router.post("/", createUser);

// PATCH role — admin only
router.patch("/:id/role", authMiddleware, allowRoles("admin"), updateUserRole);

// PATCH status — admin only
router.patch("/:id/status", authMiddleware, allowRoles("admin"), updateUserStatus);

// GET / PUT / DELETE by id — admin only
router.route("/:id")
  .get(authMiddleware, allowRoles("admin"), getUserById)
  .put(authMiddleware, allowRoles("admin"), updateUser)
  .delete(authMiddleware, allowRoles("admin"), deleteUser);

export default router;
