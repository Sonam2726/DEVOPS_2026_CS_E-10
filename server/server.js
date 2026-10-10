
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("./config/db");

// Skill routes
const skillRoutes = require("./routes/skillRoutes");

// Auth routes
const authRoutes = require("./routes/authRoutes");

// User routes
const userRoutes = require("./routes/userRoutes");

// Settings routes
const settingsRoutes = require("./routes/settingsRoutes");

// Notification routes
const notificationRoutes = require("./routes/notificationRoutes");

// Review routes
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// Skill API routes
app.use("/api/skills", skillRoutes);

// Auth API routes
app.use("/api/auth", authRoutes);

// Matching, request and session routes
app.use("/api/matches", require("./routes/matchingRoutes"));
app.use("/api/requests", require("./routes/requestRoutes"));
app.use("/api/sessions", require("./routes/sessionRoutes"));

// User API routes
app.use("/api/users", userRoutes);

// Settings API routes
app.use("/api/settings", settingsRoutes);

// Notification API routes
app.use("/api/notifications", notificationRoutes);

// Review API routes
app.use("/api/reviews", reviewRoutes);

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
