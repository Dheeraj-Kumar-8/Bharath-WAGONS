import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    console.log(`[GET /api/users] returned ${users.length} users`);
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    console.log("[POST /api/users] body:", JSON.stringify({ ...req.body, password: "[hidden]" }));
    const { name, email, password, role, zone } = req.body;

    // Duplicate check
    const existing = await User.findOne({ email: email?.trim().toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: "A user with this email already exists" });
    }

    // Hash password before storing
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name?.trim(),
      email: email?.trim().toLowerCase(),
      password: passwordHash,
      role: role?.toLowerCase(),
      zone: zone || "NR",
    });
    console.log(`[POST /api/users] saved _id=${user._id}`);
    res.status(201).json({ success: true, data: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "A user with this email already exists" });
    }
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)[0].message;
      return res.status(400).json({ success: false, message });
    }
    console.error("[POST /api/users] error:", error.message);
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { name, zone, status } = req.body;
    const updates = {};
    if (name   !== undefined) updates.name   = name.trim();
    if (zone   !== undefined) updates.zone   = zone;
    if (status !== undefined) updates.status = status;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, message: "User updated successfully", user });
  } catch (error) {
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)[0].message;
      return res.status(400).json({ success: false, message });
    }
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  const ALLOWED_ROLES = ["admin", "operator", "analyst"];
  const { role } = req.body;

  if (!role || !ALLOWED_ROLES.includes(role)) {
    return res.status(400).json({
      success: false,
      message: `Invalid role. Allowed values: ${ALLOWED_ROLES.join(", ")}`,
    });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, message: "User role updated successfully", user });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  const ALLOWED_STATUSES = ["active", "inactive", "suspended", "blocked"];
  const { status } = req.body;

  if (!status || !ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Allowed values: ${ALLOWED_STATUSES.join(", ")}`,
    });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, message: "User status updated successfully", user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const requestedId = req.params.id;
    const loggedInId  = req.user.id || req.user._id;

    if (requestedId === String(loggedInId)) {
      return res.status(400).json({ success: false, message: "You cannot delete your own account" });
    }

    const user = await User.findByIdAndDelete(requestedId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};
