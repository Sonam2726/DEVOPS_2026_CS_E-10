const User = require("../models/User");


// Get profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate("skillsToTeach")
      .populate("skillsToLearn");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: {
        profile: {
          id: user._id,
          name: user.name,
          email: user.email,
          bio: user.bio,
          location: user.location,
          profileImage: user.profileImage,
          role: user.role,
          isActive: user.isActive,
          skillsToTeach: user.skillsToTeach,
          skillsToLearn: user.skillsToLearn,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
    });
  }
};


// Update profile
const updateProfile = async (req, res) => {
  try {
    const { name, bio, location, profileImage } = req.body;

    const updates = {};

    if (name !== undefined) {
      const trimmedName = name.trim();

      if (trimmedName.length < 2 || trimmedName.length > 50) {
        return res.status(400).json({
          success: false,
          message: "Name must be between 2 and 50 characters long",
        });
      }

      updates.name = trimmedName;
    }

    if (bio !== undefined) {
      if (bio.length > 300) {
        return res.status(400).json({
          success: false,
          message: "Bio cannot exceed 300 characters",
        });
      }

      updates.bio = bio.trim();
    }

    if (location !== undefined) {
      if (location.length > 100) {
        return res.status(400).json({
          success: false,
          message: "Location cannot exceed 100 characters",
        });
      }

      updates.location = location.trim();
    }

    if (profileImage !== undefined) {
      updates.profileImage = profileImage.trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid profile fields provided for update",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        profile: {
          id: user._id,
          name: user.name,
          email: user.email,
          bio: user.bio,
          location: user.location,
          profileImage: user.profileImage,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating profile",
    });
  }
};


// Update skills to teach and learn
const updateUserSkills = async (req, res) => {
  try {
    const { skillsToTeach, skillsToLearn } = req.body;

    // Validation
    if (
      skillsToTeach !== undefined &&
      !Array.isArray(skillsToTeach)
    ) {
      return res.status(400).json({
        success: false,
        message: "skillsToTeach must be an array",
      });
    }

    if (
      skillsToLearn !== undefined &&
      !Array.isArray(skillsToLearn)
    ) {
      return res.status(400).json({
        success: false,
        message: "skillsToLearn must be an array",
      });
    }

    if (
      skillsToTeach === undefined &&
      skillsToLearn === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide skillsToTeach or skillsToLearn",
      });
    }

    const updates = {};

    if (skillsToTeach !== undefined) {
      updates.skillsToTeach = skillsToTeach;
    }

    if (skillsToLearn !== undefined) {
      updates.skillsToLearn = skillsToLearn;
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("skillsToTeach")
      .populate("skillsToLearn");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User skills updated successfully",
      data: {
        skillsToTeach: user.skillsToTeach,
        skillsToLearn: user.skillsToLearn,
      },
    });
  } catch (error) {
    console.error("Update user skills error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating skills",
    });
  }
};


module.exports = {
  getProfile,
  updateProfile,
  updateUserSkills,
};