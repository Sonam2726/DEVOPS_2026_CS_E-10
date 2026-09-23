const Skill = require("../models/Skill");

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

    const skill = await Skill.create({
      name,
      description,
      category,
      level
    });

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

module.exports = {
  createSkill
};