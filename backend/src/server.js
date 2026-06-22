import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";
import userRoutes from "./routes/userRoutes.js";
import wagonRoutes from "./routes/wagonRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Health Check ---
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Railway Command Centre Backend Running",
    timestamp: new Date().toISOString(),
  });
});

// --- API Routes ---
app.use("/api/users", userRoutes);
app.use("/api/wagons", wagonRoutes);
app.use("/api/analytics", analyticsRoutes);

// --- Centralized Error Handler (must be last) ---
app.use(errorHandler);

// --- Connect DB then Start Server ---
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
