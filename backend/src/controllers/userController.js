import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    console.log(`[GET /api/users] returned ${users.length} users`);
    res.json({ success: true, count: users.length, data: users });
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
    console.log(`[PUT /api/users/${req.params.id}] body:`, JSON.stringify(req.body));
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...req.body, ...(req.body.role ? { role: req.body.role.toLowerCase() } : {}) },
      { new: true, runValidators: true }
    ).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    console.log(`[PUT /api/users/${req.params.id}] updated`);
    res.json({ success: true, data: user });
  } catch (error) {
    console.error(`[PUT /api/users/${req.params.id}] error:`, error.message);
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    console.log(`[DELETE /api/users/${req.params.id}]`);
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    console.log(`[DELETE /api/users/${req.params.id}] deleted`);
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error(`[DELETE /api/users/${req.params.id}] error:`, error.message);
    next(error);
  }
};
