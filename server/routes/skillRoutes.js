const express = require("express");

const {
  createSkill,
  getSkills,
  getSkillById
} = require("../controllers/skillController");

const router = express.Router();

// Create a new skill
router.post("/", createSkill);

// Get all skills
router.get("/", getSkills);

// Get skill by ID
router.get("/:id", getSkillById);

module.exports = router;