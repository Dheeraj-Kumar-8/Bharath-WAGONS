import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema(
  {
    metricName: { type: String, required: true },
    metricValue: { type: mongoose.Schema.Types.Mixed, required: true },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Analytics", analyticsSchema);
