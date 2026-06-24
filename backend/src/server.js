import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";
import userRoutes from "./routes/userRoutes.js";
import wagonRoutes from "./routes/wagonRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// --- CORS: allow frontend origins ---
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// --- Body parsing ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Request logger (password field redacted) ---
app.use((req, res, next) => {
  const safe = { ...req.body };
  if (safe.password) safe.password = "[hidden]";
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, Object.keys(safe).length ? safe : "");
  next();
});

// --- Health check ---
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Railway Command Centre Backend Running", timestamp: new Date().toISOString() });
});

// --- Debug: DB status ---
app.get("/api/debug/db-status", async (req, res) => {
  try {
    const state = mongoose.connection.readyState;
    const stateMap = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };
    const dbName = mongoose.connection.name || "unknown";
    const collections = state === 1
      ? (await mongoose.connection.db.listCollections().toArray()).map(c => c.name)
      : [];
    res.json({
      success: true,
      connectionState: stateMap[state] || state,
      databaseName: dbName,
      collections,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- Debug: test save ---
app.post("/api/debug/test-save", async (req, res) => {
  try {
    const { default: Analytics } = await import("./models/Analytics.js");
    const doc = await Analytics.create({
      metricName: "debug_test",
      metricValue: { savedAt: new Date().toISOString(), source: "test-save endpoint" },
    });
    console.log("[DEBUG test-save] Document saved:", doc._id.toString());
    res.status(201).json({
      success: true,
      message: "Test document saved to MongoDB Atlas successfully",
      documentId: doc._id,
      savedAt: doc.createdAt,
    });
  } catch (error) {
    console.error("[DEBUG test-save] FAILED:", error.message, error.stack);
    res.status(500).json({ success: false, message: error.message, stack: error.stack });
  }
});

// --- API Routes ---
app.use("/api/auth",      authRoutes);
app.use("/api/users",     userRoutes);
app.use("/api/wagons",    wagonRoutes);
app.use("/api/analytics", analyticsRoutes);

// --- Centralized error handler ---
app.use(errorHandler);

// --- Connect DB then start server ---
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`   Health:    GET  http://localhost:${PORT}/api/health`);
    console.log(`   DB Status: GET  http://localhost:${PORT}/api/debug/db-status`);
    console.log(`   Test Save: POST http://localhost:${PORT}/api/debug/test-save\n`);
  });
});
