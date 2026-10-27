const mongoose = require("mongoose");
const User = require('../models/User');

// Recommended users based on skills (Day 4)
exports.getRecommendations = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Match users who teach what the current user wants to learn
    const matches = await User.find({
      _id: { $ne: req.user.userId },
      skillsToTeach: { $in: currentUser.skillsToLearn || [] }
    }).select('-password');

    res.json({
      success: true,
      count: matches.length,
      matches
    });
  } catch (err) {
    console.error("Get recommendations error:", {
      name: err?.name || "UnknownError",
      code: err?.code,
    });
    res.status(500).json({
      success: false,
      message: "Failed to fetch recommendations"
    });
  }
};

// Match details API (Day 5)
exports.getMatchDetails = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const targetUser = await User.findById(req.params.id).select('-password');

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: targetUser
    });
  } catch (err) {
    console.error("Get match details error:", {
      name: err?.name || "UnknownError",
      code: err?.code,
    });
    res.status(500).json({
      success: false,
      message: "Failed to fetch match details"
    });
  }
};