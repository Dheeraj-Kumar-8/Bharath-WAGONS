import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: {
        values: ["admin", "operator", "analyst"],
        message: "Role must be one of: admin, operator, analyst",
      },
      required: [true, "Role is required"],
      set: (v) => (typeof v === "string" ? v.toLowerCase() : v),
    },
    zone: {
      type: String,
      enum: {
        values: ["NR", "SR", "ER", "WR", "CR", "SCR", "NER", "NWR", "SER", "SWR"],
        message: "Zone must be one of: NR, SR, ER, WR, CR, SCR, NER, NWR, SER, SWR",
      },
      required: [true, "Zone is required"],
    },
    status: {
      type: String,
      enum: {
        values: ["active", "inactive", "suspended", "blocked"],
        message: "Status must be one of: active, inactive, suspended, blocked",
      },
      default: "active",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // createdAt is managed manually above
    versionKey: false,
  }
);

export default mongoose.model("User", userSchema);
