const express = require("express");

const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../controllers/notificationController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Get all notifications for current user
router.get("/", protect, getNotifications);

// Mark all notifications as read
router.put("/read-all", protect, markAllNotificationsAsRead);

// Mark a single notification as read
router.put("/:id/read", protect, markNotificationAsRead);

module.exports = router;