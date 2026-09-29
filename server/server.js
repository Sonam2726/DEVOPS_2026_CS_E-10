const express = require("express");
const cors = require("cors");
require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("./config/db");

// Skill routes
const skillRoutes = require("./routes/skillRoutes");

// Auth routes
const authRoutes = require("./routes/authRoutes");
const protect = require("./middleware/authMiddleware");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// Skill API routes
app.use("/api/skills", skillRoutes);

// Auth API routes
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.json({
    message: "SkillBridge AI Backend is running successfully!",
  });
});

app.get("/api/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1;

  res.status(dbStatus ? 200 : 503).json({
    status: dbStatus ? "healthy" : "unhealthy",
    server: "running",
    database: dbStatus ? "connected" : "disconnected",
  });
});

app.get("/api/auth/protected-test", protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Protected route accessed successfully",
    user: req.user,
  });
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});