
const mongoose = require("mongoose");
const Request = require("../models/Request");
const User = require("../models/User");

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

    const receiverExists = await User.exists({ _id: receiverId });

    if (!receiverExists) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    const request = await Request.create({
      sender: req.user.userId,
      receiver: receiverId,
      skillToLearn: skillToLearn.trim(),
      message: typeof message === "string" ? message.trim() : "",
    });

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

    const request = await Request.findOne({
      _id: req.params.id,
      receiver: req.user.userId,
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found or not authorized",
      });
    }

    request.status = status;
    await request.save();

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
exports.getMyRequests = async (req, res) => {
  try {
    const incoming = await Request.find({
      receiver: req.user.userId,
    })
      .populate("sender", "name email")
      .sort({ createdAt: -1 });

    const outgoing = await Request.find({
      sender: req.user.userId,
    })
      .populate("receiver", "name email")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
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
