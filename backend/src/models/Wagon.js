import mongoose from "mongoose";

const wagonSchema = new mongoose.Schema(
  {
    wagonId:         { type: String, required: true, unique: true },
    wagonType:       { type: String, required: true },
    currentLocation: { type: String, default: "Unknown" },
    destination:     { type: String, default: "—" },
    speed:           { type: Number, default: 0 },
    capacity:        { type: String, default: "—" },
    zone:            { type: String, default: "NR" },
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
