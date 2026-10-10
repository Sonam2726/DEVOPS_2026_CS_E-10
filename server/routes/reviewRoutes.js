
const express = require("express");

const {
  submitReview,
  getReviews,
  getRatingSummary,
} = require("../controllers/reviewController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Fetch reviews received by a user
router.get("/user/:userId", getReviews);

// Fetch total reviews and average rating
router.get("/user/:userId/summary", getRatingSummary);

// Submit a review (login required)
router.post("/", protect, submitReview);

module.exports = router;
