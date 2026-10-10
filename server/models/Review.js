
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    // User who gives the review
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // User who receives the review
    reviewedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Skill related to the review
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },

    // Related match, if applicable
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      default: null,
    },

    // Related session, if applicable
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      default: null,
    },

    // Rating between 1 and 5
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // Review comment
    comment: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster review queries
reviewSchema.index({ reviewedUser: 1, createdAt: -1 });
reviewSchema.index({ reviewer: 1 });

// Export Review model
module.exports = mongoose.model("Review", reviewSchema);
