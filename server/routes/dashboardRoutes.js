const express = require("express");

const {
  getDashboard,
} = require("../controllers/dashboardController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Get dashboard data for current user
router.get("/", protect, getDashboard);

module.exports = router;