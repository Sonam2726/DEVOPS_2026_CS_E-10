
const mongoose = require("mongoose");
const Review = require("../models/Review");
const Skill = require("../models/Skill");
const User = require("../models/User");

// DAY 10: Submit a review
const submitReview = async (req, res) => {
  try {
    const { reviewedUser, skill, rating, comment } = req.body;

    if (!reviewedUser || !skill || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: "reviewedUser, skill and rating are required",
      });
    }

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

    const userExists = await User.findById(reviewedUser);

    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "Reviewed user not found",
      });
    }

    const skillExists = await Skill.findById(skill);

    if (!skillExists) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    if (String(req.user.userId) === String(reviewedUser)) {
      return res.status(400).json({
        success: false,
        message: "You cannot review yourself",
      });
    }

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

// DAY 11: Fetch reviews received by a user
const getReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const userExists = await User.findById(userId);

    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const reviews = await Review.find({ reviewedUser: userId })
      .populate("reviewer", "name")
      .populate("reviewedUser", "name")
      .populate("skill", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Reviews fetched successfully",
      data: reviews,
    });
  } catch (error) {
    console.error("Fetch reviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// DAY 11: Get total reviews and average rating
const getRatingSummary = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const userExists = await User.findById(userId);

    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const reviews = await Review.find({ reviewedUser: userId })
      .select("rating");

    const totalReviews = reviews.length;

    let averageRating = 0;

    if (totalReviews > 0) {
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );

      averageRating = Number((totalRating / totalReviews).toFixed(2));
    }

    return res.status(200).json({
      success: true,
      message: "Rating summary fetched successfully",
      data: {
        totalReviews,
        averageRating,
      },
    });
  } catch (error) {
    console.error("Rating summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  submitReview,
  getReviews,
  getRatingSummary,
};
