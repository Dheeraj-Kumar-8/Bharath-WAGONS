import Analytics from "../models/Analytics.js";

// GET /api/analytics — return all analytics metrics
export const getAnalytics = async (req, res, next) => {
  try {
    const metrics = await Analytics.find().sort({ generatedAt: -1 });
    res.json({ success: true, count: metrics.length, data: metrics });
  } catch (error) {
    next(error);
  }
};
