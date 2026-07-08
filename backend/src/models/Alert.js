import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    alertId:   { type: String, required: true, unique: true },
    wagonId:   { type: String, required: true },
    wagonRef:  { type: mongoose.Schema.Types.ObjectId, ref: "Wagon" },
    type:      { type: String, required: true },
    reason:    { type: String, required: true },
    priority:  { type: String, enum: ["Critical", "High", "Medium", "Low"], required: true },
    zone:      { type: String, required: true },
    status:    { type: String, enum: ["Active", "Pending", "Resolved"], default: "Active" },
    desc:      { type: String, default: "" },
    resolvedAt: { type: Date, default: null },
    resolvedBy: { type: String, default: null },
  },
  { timestamps: true }
);

// Index for fast zone-scoped queries
alertSchema.index({ zone: 1, status: 1 });
alertSchema.index({ wagonId: 1 });

export default mongoose.model("Alert", alertSchema);
