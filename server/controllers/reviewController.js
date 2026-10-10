
const Review = require("../models/Review");
const Skill = require("../models/Skill");

const submitReview = async (req, res) => {
  try {
    const { reviewedUser, skill, rating, comment } = req.body;

    // Check required fields
    if (!reviewedUser || !skill || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: "reviewedUser, skill and rating are required",
      });
    }

    // Validate rating
    if (
      typeof rating !== "number" ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5",
      });
    }

    // Check whether the reviewed user exists
    const User = require("../models/User");
    const userExists = await User.findById(reviewedUser);

    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "Reviewed user not found",
      });
    }

    // Check whether the skill exists
    const skillExists = await Skill.findById(skill);

    if (!skillExists) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    // Prevent reviewing yourself
    if (String(req.user.userId) === String(reviewedUser)) {
      return res.status(400).json({
        success: false,
        message: "You cannot review yourself",
      });
    }

    // Create review
    const review = await Review.create({
      reviewer: req.user.userId,
      reviewedUser,
      skill,
      rating,
      comment: comment || "",
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid user or skill ID",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Submit review error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { submitReview };
