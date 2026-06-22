import mongoose from "mongoose";

const wagonSchema = new mongoose.Schema(
  {
    wagonId: { type: String, required: true, unique: true },
    wagonType: { type: String, required: true },
    currentLocation: { type: String, default: "Unknown" },
    status: {
      type: String,
      enum: ["Active", "Idle", "Maintenance", "Decommissioned"],
      default: "Idle",
    },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Wagon", wagonSchema);
