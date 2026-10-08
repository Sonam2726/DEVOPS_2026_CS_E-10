const express = require("express");

const {
  getProfile,
  updateProfile,
  updateUserSkills,
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// Get user profile
router.get("/profile", protect, getProfile);


// Update user profile
router.put("/profile", protect, updateProfile);


// Update skills to teach and learn
router.put("/skills", protect, updateUserSkills);


module.exports = router;