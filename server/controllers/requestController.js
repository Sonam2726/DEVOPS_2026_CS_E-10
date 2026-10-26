
const mongoose = require("mongoose");
const Request = require("../models/Request");
const Skill = require("../models/Skill");
const User = require("../models/User");
const Notification = require("../models/Notification");

// POST /api/requests
exports.sendRequest = async (req, res) => {
  try {
    const { receiverId, skillToLearn, message } = req.body;

    if (!receiverId || !skillToLearn?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID and skill are required",
      });
    }

    if (!mongoose.isValidObjectId(receiverId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid receiver ID",
      });
    }

    if (receiverId === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a request to yourself",
      });
    }

    const trimmedSkillToLearn = skillToLearn.trim();
    const skill = await Skill.findOne({
      name: trimmedSkillToLearn,
      owner: receiverId,
    }).select("_id owner");

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found or receiver is not its owner",
      });
    }

    const receiverExists = await User.exists({ _id: skill.owner });

    if (!receiverExists) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    const duplicateRequest = await Request.exists({
      sender: req.user.userId,
      receiver: skill.owner,
      skillToLearn: trimmedSkillToLearn,
      status: "pending",
    });

    if (duplicateRequest) {
      return res.status(409).json({
        success: false,
        message: "A pending request for this skill already exists",
      });
    }

    const request = await Request.create({
      sender: req.user.userId,
      receiver: skill.owner,
      skillToLearn: trimmedSkillToLearn,
      message: typeof message === "string" ? message.trim() : "",
    });

    const notification = new Notification({
      user: request.receiver,
      type: "skill_request",
      title: "New learning request",
      message: `You received a request to learn ${request.skillToLearn}.`,
    });

    try {
      await notification.save();
    } catch (notificationError) {
      let notificationRemoved = false;

      try {
        await Notification.deleteOne({ _id: notification._id });
        notificationRemoved = true;
      } catch (cleanupError) {
        console.error(
          "Failed to clean up learning request notification:",
          cleanupError.name || "Unknown error"
        );
      }

      if (notificationRemoved) {
        try {
          const rollback = await Request.deleteOne({ _id: request._id });

          if (rollback.deletedCount !== 1) {
            console.error("Failed to roll back learning request after notification failure");
          }
        } catch (cleanupError) {
          console.error(
            "Failed to roll back learning request:",
            cleanupError.name || "Unknown error"
          );
        }
      }

      console.error(
        "Failed to create learning request notification:",
        notificationError.name || "Unknown error"
      );
      return res.status(500).json({
        success: false,
        message: "Failed to send request",
      });
    }

    return res.status(201).json({
      success: true,
      request,
    });
  } catch (err) {
    console.error("Send request error:", err.message);

    return res.status(500).json({
      success: false,
      message: "Failed to send request",
    });
  }
};

// PUT /api/requests/:id/status
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID",
      });
    }

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be accepted or rejected",
      });
    }

    const request = await Request.findOneAndUpdate(
      {
        _id: req.params.id,
        receiver: req.user.userId,
        status: "pending",
      },
      {
        $set: { status },
      },
      { new: true }
    );

    if (!request) {
      const existingRequest = await Request.exists({
        _id: req.params.id,
        receiver: req.user.userId,
      });

      if (existingRequest) {
        return res.status(409).json({
          success: false,
          message: "Request has already been resolved",
        });
      }

      return res.status(404).json({
        success: false,
        message: "Request not found or not authorized",
      });
    }

    const notification = new Notification({
      user: request.sender,
      type:
        status === "accepted"
          ? "skill_request_accepted"
          : "skill_request_rejected",
      title:
        status === "accepted"
          ? "Learning request accepted"
          : "Learning request rejected",
      message:
        status === "accepted"
          ? `Your request to learn ${request.skillToLearn} was accepted.`
          : `Your request to learn ${request.skillToLearn} was rejected.`,
    });

    try {
      await notification.save();
    } catch (notificationError) {
      let notificationRemoved = false;

      try {
        await Notification.deleteOne({ _id: notification._id });
        notificationRemoved = true;
      } catch (cleanupError) {
        console.error(
          "Failed to clean up request status notification:",
          cleanupError.name || "Unknown error"
        );
      }

      if (notificationRemoved) {
        try {
          const rollback = await Request.updateOne(
            {
              _id: request._id,
              receiver: req.user.userId,
              status,
            },
            {
              $set: { status: "pending" },
            }
          );

          if (rollback.modifiedCount !== 1) {
            console.error("Failed to roll back request status after notification failure");
          }
        } catch (cleanupError) {
          console.error(
            "Failed to roll back request status:",
            cleanupError.name || "Unknown error"
          );
        }
      }

      console.error(
        "Failed to create request status notification:",
        notificationError.name || "Unknown error"
      );
      return res.status(500).json({
        success: false,
        message: "Failed to update request status",
      });
    }

    return res.json({
      success: true,
      request,
    });
  } catch (err) {
    console.error("Update request status error:", err.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update request status",
    });
  }
};

// GET /api/requests

 // GET /api/requests?page=1&limit=10
exports.getMyRequests = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    const skip = (page - 1) * limit;

    const [incoming, outgoing, totalIncoming, totalOutgoing] =
      await Promise.all([
        Request.find({ receiver: req.user.userId })
          .populate("sender", "name email")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),

        Request.find({ sender: req.user.userId })
          .populate("receiver", "name email")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),

        Request.countDocuments({ receiver: req.user.userId }),
        Request.countDocuments({ sender: req.user.userId }),
      ]);

    return res.json({
      success: true,
      pagination: {
        page,
        limit,
        totalIncoming,
        totalOutgoing,
        totalIncomingPages: Math.ceil(totalIncoming / limit),
        totalOutgoingPages: Math.ceil(totalOutgoing / limit),
      },
      incoming,
      outgoing,
    });
  } catch (err) {
    console.error("Get requests error:", err.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch requests",
    });
  }
};
