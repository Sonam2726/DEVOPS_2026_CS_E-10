
const mongoose = require("mongoose");
const Session = require("../models/Session");
const Request = require("../models/Request");
const Skill = require("../models/Skill");

// Create session
exports.createSession = async (req, res) => {
  try {
    const {
      requestId,
      scheduledAt,
      durationMinutes,
      meetingLink,
      notes,
    } = req.body;

    if (typeof requestId !== "string" || !mongoose.isValidObjectId(requestId)) {
      return res.status(400).json({
        success: false,
        message: "Valid request ID is required",
      });
    }

    if (!scheduledAt) {
      return res.status(400).json({
        success: false,
        message: "Scheduled time is required",
      });
    }

    const request = await Request.findOne({
      _id: requestId,
      $or: [
        { sender: req.user.userId },
        { receiver: req.user.userId },
      ],
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found or not authorized",
      });
    }

    if (request.status !== "accepted") {
      return res.status(409).json({
        success: false,
        message: "Only accepted requests can be scheduled",
      });
    }

    const skill = await Skill.findOne({
      name: request.skillToLearn,
      owner: request.receiver,
    }).select("_id name owner");

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "The requested skill is no longer available",
      });
    }

    if (await Session.exists({ request: request._id })) {
      return res.status(409).json({
        success: false,
        message: "A session already exists for this request",
      });
    }

    const parsedDate = new Date(scheduledAt);

    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid scheduled date",
      });
    }

    if (parsedDate.getTime() <= Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Scheduled time must be in the future",
      });
    }

    const duration =
      durationMinutes === undefined ? 60 : Number(durationMinutes);

    if (!Number.isFinite(duration) || duration <= 0) {
      return res.status(400).json({
        success: false,
        message: "Duration must be a positive number",
      });
    }

    if (
      meetingLink !== undefined &&
      typeof meetingLink !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Meeting link must be a string",
      });
    }

    if (notes !== undefined && typeof notes !== "string") {
      return res.status(400).json({
        success: false,
        message: "Notes must be a string",
      });
    }

    let session;

    try {
      session = await Session.create({
        request: request._id,
        mentor: request.receiver,
        learner: request.sender,
        skill: skill.name,
        scheduledAt: parsedDate,
        durationMinutes: duration,
        meetingLink: meetingLink?.trim() || "",
        notes: notes?.trim() || "",
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "A session already exists for this request",
        });
      }

      throw err;
    }

    return res.status(201).json({
      success: true,
      session,
    });
  } catch (err) {
    console.error("Create session error:", err.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create session",
    });
  }
};

// Get my sessions
exports.getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [
        { mentor: req.user.userId },
        { learner: req.user.userId },
      ],
    })
      .populate("mentor", "name email")
      .populate("learner", "name email")
      .sort({ scheduledAt: 1 });

    return res.json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (err) {
    console.error("Get sessions error:", err.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch sessions",
    });
  }
};

// Update or cancel session
exports.updateSession = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID",
      });
    }

    const session = await Session.findOne({
      _id: req.params.id,
      $or: [
        { mentor: req.user.userId },
        { learner: req.user.userId },
      ],
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found or unauthorized",
      });
    }

    const allowedFields = [
      "scheduledAt",
      "durationMinutes",
      "status",
      "meetingLink",
      "notes",
    ];

    const updates = {};
    const suppliedFields = Object.keys(req.body);

    if (
      suppliedFields.length === 0 ||
      suppliedFields.some((field) => !allowedFields.includes(field))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or unsupported session update fields",
      });
    }

    if (req.body.scheduledAt !== undefined) {
      const date = new Date(req.body.scheduledAt);

      if (Number.isNaN(date.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid scheduled date",
        });
      }

      updates.scheduledAt = date;
    }

    if (req.body.durationMinutes !== undefined) {
      const duration = Number(req.body.durationMinutes);

      if (!Number.isFinite(duration) || duration <= 0) {
        return res.status(400).json({
          success: false,
          message: "Duration must be a positive number",
        });
      }

      updates.durationMinutes = duration;
    }

    if (req.body.status !== undefined) {
      if (
        !["upcoming", "completed", "cancelled"].includes(
          req.body.status
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid session status",
        });
      }

      if (session.status !== "upcoming" && req.body.status !== session.status) {
        return res.status(409).json({
          success: false,
          message: "Completed or cancelled sessions cannot be reopened",
        });
      }

      if (session.status === "upcoming" && req.body.status === "completed") {
        if (session.mentor.toString() !== req.user.userId) {
          return res.status(403).json({
            success: false,
            message: "Only the session mentor can mark it as completed",
          });
        }

        if (Date.now() < session.scheduledAt.getTime()) {
          return res.status(400).json({
            success: false,
            message: "A session cannot be completed before its scheduled time",
          });
        }
      }

      updates.status = req.body.status;
    }

    for (const field of ["meetingLink", "notes"]) {
      if (req.body[field] !== undefined) {
        if (typeof req.body[field] !== "string") {
          return res.status(400).json({
            success: false,
            message: `${field} must be a string`,
          });
        }

        updates[field] = req.body[field].trim();
      }
    }

    Object.assign(session, updates);
    await session.save();

    return res.json({
      success: true,
      session,
    });
  } catch (err) {
    console.error("Update session error:", err.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update session",
    });
  }
};
