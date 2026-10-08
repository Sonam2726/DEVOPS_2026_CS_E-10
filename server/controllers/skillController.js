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


// Get all skills with filters, pagination and sorting
const getSkills = async (req, res) => {
  try {
    const {
      category,
      level,
      page = 1,
      limit = 10,
      sort = "name"
    } = req.query;

    // Filter object
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (level) {
      filter.level = level;
    }

    // Pagination
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Get skills
    const skills = await Skill.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNumber);

    // Total skills
    const totalSkills = await Skill.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Skills fetched successfully",
      data: skills,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total: totalSkills,
        totalPages: Math.ceil(totalSkills / limitNumber)
      }
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