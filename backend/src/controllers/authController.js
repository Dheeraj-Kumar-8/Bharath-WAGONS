import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, zone } = req.body;

    // --- Required field validation ---
    const missing = ["name", "email", "password", "role"].filter(
      (f) => !req.body[f] || String(req.body[f]).trim() === ""
    );
    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(", ")}`,
      });
    }

    // --- Duplicate email check ---
    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    // --- Hash password before saving ---
    const passwordHash = await bcrypt.hash(password, 10);

    await User.create({
      name:     name.trim(),
      email:    email.trim().toLowerCase(),
      password: passwordHash,
      role:     role?.toLowerCase(),
      zone:     zone || "NR",
    });

    console.log(`[POST /api/auth/register] registered: ${email}`);

    res.status(201).json({
      success: true,
      message: "User Registered Successfully",
    });
  } catch (error) {
    // Mongoose duplicate key (race condition fallback)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists",
      });
    }
    // Mongoose validation errors — return first message
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)[0].message;
      return res.status(400).json({ success: false, message });
    }
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email?.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // --- Status check: only active accounts may log in ---
    if (user.status !== "active") {
      const statusMessages = {
        suspended: "Account suspended",
        inactive:  "Account inactive",
        blocked:   "Account blocked",
      };
      const message = statusMessages[user.status] || "Account is not active";
      console.log(`[POST /api/auth/login] blocked — status "${user.status}": ${email}`);
      return res.status(403).json({ success: false, message });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, zone: user.zone },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log(`[POST /api/auth/login] login: ${email}`);

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      role: user.role,
      zone: user.zone,
      name: user.name,
    });
  } catch (error) {
    next(error);
  }
};
