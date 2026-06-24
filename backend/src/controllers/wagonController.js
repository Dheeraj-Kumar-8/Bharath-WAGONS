import Wagon from "../models/Wagon.js";

export const getWagons = async (req, res, next) => {
  try {
    const wagons = await Wagon.find().sort({ createdAt: -1 });
    console.log(`[GET /api/wagons] returned ${wagons.length} wagons`);
    res.json({ success: true, count: wagons.length, data: wagons });
  } catch (error) {
    next(error);
  }
};

export const createWagon = async (req, res, next) => {
  try {
    console.log("[POST /api/wagons] body:", JSON.stringify(req.body));
    const wagon = await Wagon.create(req.body);
    console.log(`[POST /api/wagons] saved _id=${wagon._id}, wagonId=${wagon.wagonId}`);
    res.status(201).json({ success: true, data: wagon });
  } catch (error) {
    console.error("[POST /api/wagons] error:", error.message);
    next(error);
  }
};

export const updateWagon = async (req, res, next) => {
  try {
    console.log(`[PUT /api/wagons/${req.params.id}] body:`, JSON.stringify(req.body));
    const wagon = await Wagon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!wagon) return res.status(404).json({ success: false, message: "Wagon not found" });
    console.log(`[PUT /api/wagons/${req.params.id}] updated`);
    res.json({ success: true, data: wagon });
  } catch (error) {
    console.error(`[PUT /api/wagons/${req.params.id}] error:`, error.message);
    next(error);
  }
};

export const deleteWagon = async (req, res, next) => {
  try {
    console.log(`[DELETE /api/wagons/${req.params.id}]`);
    const wagon = await Wagon.findByIdAndDelete(req.params.id);
    if (!wagon) return res.status(404).json({ success: false, message: "Wagon not found" });
    console.log(`[DELETE /api/wagons/${req.params.id}] deleted`);
    res.json({ success: true, message: "Wagon deleted" });
  } catch (error) {
    console.error(`[DELETE /api/wagons/${req.params.id}] error:`, error.message);
    next(error);
  }
};
