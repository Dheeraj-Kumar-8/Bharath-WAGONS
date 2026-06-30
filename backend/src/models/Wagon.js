import mongoose from "mongoose";

const wagonSchema = new mongoose.Schema(
  {
    wagonId:        { type: String, required: true, unique: true },
    wagonNumber:    { type: String, default: "" },
    wagonType:      { type: String, required: true },
    zone:           { type: String, default: "NR" },
    zoneName:       { type: String, default: "" },
    division:       { type: String, default: "" },
    currentStation: { type: String, default: "Unknown" },
    destination:    { type: String, default: "" },
    cargoType:      { type: String, default: "" },
    capacity:       { type: Number, default: 0 },
    currentLoad:    { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Running", "Loading", "Unloading", "Delayed", "Maintenance", "Idle"],
      default: "Idle",
    },
    gpsLatitude:  { type: Number, default: 0 },
    gpsLongitude: { type: Number, default: 0 },
    speed:        { type: Number, default: 0 },
    temperature:  { type: Number, default: 0 },
    lastUpdated:  { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Wagon", wagonSchema);
