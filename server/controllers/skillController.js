const Skill = require("../models/Skill");


// Create a new skill
const createSkill = async (req, res) => {
  try {
    const { name, description, category, level } = req.body;

    // Validation
    if (!name || !description || !category || !level) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Create skill
    const skill = await Skill.create({
      name,
      description,
      category,
      level
    });

    // Success response
    res.status(201).json({
      success: true,
      message: "Skill created successfully",
      data: skill
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


// Get all skills
const getSkills = async (req, res) => {
  try {
    const skills = await Skill.find();

    res.status(200).json({
      success: true,
      message: "Skills fetched successfully",
      data: skills
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


// Get skill by ID
const getSkillById = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Skill fetched successfully",
      data: skill
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


// Search skills
const searchSkills = async (req, res) => {
  try {
    const { name } = req.query;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Search name is required"
      });
    }

    // Search skill by name
    const skills = await Skill.find({
      name: { $regex: name, $options: "i" }
    });

    res.status(200).json({
      success: true,
      message: "Skills search completed successfully",
      data: skills
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


module.exports = {
  createSkill,
  getSkills,
  getSkillById,
  searchSkills
};