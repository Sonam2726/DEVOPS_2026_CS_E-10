
const express = require("express");
const { submitReview } = require("../controllers/reviewController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Submit review (login required)
router.post("/", protect, submitReview);

module.exports = router;
