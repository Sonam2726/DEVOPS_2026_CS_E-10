const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Programming",
        "Data Science",
        "Web Development",
        "Design",
        "Business",
        "Languages",
        "Other"
      ]
    },

    level: {
      type: String,
      required: true,
      enum: [
        "Beginner",
        "Intermediate",
        "Advanced"
      ]
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Skill", skillSchema);