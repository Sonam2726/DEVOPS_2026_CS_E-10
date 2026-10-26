const express = require("express");

const {
  createSkill,
  getSkills,
  getSkillById,
  searchSkills
} = require("../controllers/skillController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create a skill: login required
router.post("/", protect, createSkill);

// Get all skills: public
router.get("/", getSkills);

// Search skills: public
router.get("/search", searchSkills);

// Get a skill by ID: public
router.get("/:id", getSkillById);

module.exports = router;