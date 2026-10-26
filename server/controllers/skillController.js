const mongoose = require("mongoose");
const Skill = require("../models/Skill");

const buildSkillFilter = ({ name, category, level }) => {
  const filter = {};

  if (category) {
    filter.category = category;
  }

  if (level) {
    filter.level = level;
  }

  if (typeof name === "string" && name.trim()) {
    const escapedName = name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { name: { $regex: escapedName, $options: "i" } },
      { description: { $regex: escapedName, $options: "i" } }
    ];
  }

  return filter;
};

// Create a new skill
const createSkill = async (req, res) => {
  try {
    const { name, description, category, level } = req.body;

    // JWT middleware provides userId in req.user
    const ownerId = req.user?.userId;

    if (!ownerId || !mongoose.isValidObjectId(ownerId)) {
      return res.status(401).json({
        success: false,
        message: "Please log in with a valid account to create a skill"
      });
    }

    // Validate required fields
    if (
      !name?.trim() ||
      !description?.trim() ||
      !category ||
      !level
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, description, category and level are required"
      });
    }

    // Create skill linked to the logged-in user
    const skill = await Skill.create({
      name: name.trim(),
      description: description.trim(),
      category,
      level,
      owner: ownerId
    });

    return res.status(201).json({
      success: true,
      message: "Skill created successfully",
      data: skill
    });
  } catch (error) {
    console.error("Create skill error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create skill"
    });
  }
};


// Get all skills with filters, pagination and sorting
const getSkills = async (req, res) => {
  try {
    const {
      name,
      category,
      level,
      page = 1,
      limit = 10,
      sort = "name"
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.min(
      50,
      Math.max(1, parseInt(limit, 10) || 10)
    );

    const skip = (pageNumber - 1) * limitNumber;
    const filter = buildSkillFilter({ name, category, level });

    const allowedSortFields = [
      "name",
      "-name",
      "createdAt",
      "-createdAt",
      "level",
      "-level"
    ];

    const sortField = allowedSortFields.includes(sort)
      ? sort
      : "name";

    const [skills, totalSkills] = await Promise.all([
      Skill.find(filter)
        .populate("owner", "name")
        .sort(sortField)
        .skip(skip)
        .limit(limitNumber),
      Skill.countDocuments(filter)
    ]);

    return res.status(200).json({
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
    console.error("Get skills error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch skills"
    });
  }
};


// Get a skill by ID
const getSkillById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid skill ID"
      });
    }

    const skill = await Skill.findById(req.params.id).populate("owner", "name");

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Skill fetched successfully",
      data: skill
    });
  } catch (error) {
    console.error("Get skill by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch skill"
    });
  }
};


// Search skills by name
const searchSkills = async (req, res) => {
  try {
    const { name, category, level } = req.query;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search name is required"
      });
    }

    const skills = await Skill.find(
      buildSkillFilter({ name, category, level })
    ).populate("owner", "name");

    return res.status(200).json({
      success: true,
      message: "Skills search completed successfully",
      data: skills
    });
  } catch (error) {
    console.error("Search skills error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search skills"
    });
  }
};


module.exports = {
  createSkill,
  getSkills,
  getSkillById,
  searchSkills
};