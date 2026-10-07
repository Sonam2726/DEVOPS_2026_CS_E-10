const User = require("../models/User");

const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "settings"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Settings fetched successfully",
      data: {
        settings: user.settings,
      },
    });
  } catch (error) {
    console.error("Get settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching settings",
    });
  }
};

const updateSettings = async (req, res) => {
  try {
    const {
      emailNotifications,
      pushNotifications,
      profileVisibility,
    } = req.body;

    const updates = {};

    if (emailNotifications !== undefined) {
      if (typeof emailNotifications !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "emailNotifications must be a boolean",
        });
      }

      updates["settings.emailNotifications"] = emailNotifications;
    }

    if (pushNotifications !== undefined) {
      if (typeof pushNotifications !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "pushNotifications must be a boolean",
        });
      }

      updates["settings.pushNotifications"] = pushNotifications;
    }

    if (profileVisibility !== undefined) {
      if (!["public", "private"].includes(profileVisibility)) {
        return res.status(400).json({
          success: false,
          message: "profileVisibility must be either public or private",
        });
      }

      updates["settings.profileVisibility"] = profileVisibility;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid settings provided for update",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    ).select("settings");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: {
        settings: user.settings,
      },
    });
  } catch (error) {
    console.error("Update settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating settings",
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};