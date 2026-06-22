import User from "../models/User.js";

// GET /api/users — return all users (passwords excluded)
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};
