import Analytics from "../models/Analytics.js";

export const getAnalytics = async (req, res, next) => {
  try {
    const metrics = await Analytics.find().sort({ generatedAt: -1 });
    console.log(`[GET /api/analytics] returned ${metrics.length} records`);
    res.json({ success: true, count: metrics.length, data: metrics });
  } catch (error) {
    next(error);
  }
};

export const createAnalytic = async (req, res, next) => {
  try {
    console.log("[POST /api/analytics] body:", JSON.stringify(req.body));
    const metric = await Analytics.create(req.body);
    console.log(`[POST /api/analytics] saved _id=${metric._id}`);
    res.status(201).json({ success: true, data: metric });
  } catch (error) {
    console.error("[POST /api/analytics] error:", error.message);
    next(error);
  }
};

export const deleteAnalytic = async (req, res, next) => {
  try {
    console.log(`[DELETE /api/analytics/${req.params.id}]`);
    const metric = await Analytics.findByIdAndDelete(req.params.id);
    if (!metric) return res.status(404).json({ success: false, message: "Analytic not found" });
    res.json({ success: true, message: "Analytic deleted" });
  } catch (error) {
    next(error);
  }
};
