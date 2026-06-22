import Wagon from "../models/Wagon.js";

// GET /api/wagons — return all wagons
export const getWagons = async (req, res, next) => {
  try {
    const wagons = await Wagon.find();
    res.json({ success: true, count: wagons.length, data: wagons });
  } catch (error) {
    next(error);
  }
};
