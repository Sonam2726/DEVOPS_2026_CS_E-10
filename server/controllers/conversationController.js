const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const Request = require("../models/Request");
const User = require("../models/User");

const MAX_MESSAGE_LENGTH = 2000;

const isMember = (conversation, userId) =>
  conversation.participants.some((participant) =>
    String(participant._id || participant) === String(userId)
  );

const getConversationForUser = (id, userId) =>
  Conversation.findOne({ _id: id, participants: userId });

const serializeMessage = (message) => ({
  id: message._id,
  conversationId: message.conversation,
  senderId: message.sender,
  recipientId: message.recipient,
  content: message.content,
  createdAt: message.createdAt,
  deliveredAt: message.deliveredAt,
  readAt: message.readAt,
});

exports.listConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.userId,
    })
      .populate("participants", "name profileImage")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    const data = await Promise.all(
      conversations.map(async (conversation) => {
        const participant = conversation.participants.find(
          (item) => String(item._id) !== String(req.user.userId)
        );
        const unreadCount = await Message.countDocuments({
          conversation: conversation._id,
          recipient: req.user.userId,
          readAt: null,
        });

        return {
          id: conversation._id,
          participant: participant || null,
          lastMessage: conversation.lastMessage
            ? serializeMessage(conversation.lastMessage)
            : null,
          unreadCount,
          updatedAt: conversation.updatedAt,
        };
      })
    );

    return res.json({ success: true, conversations: data });
  } catch (error) {
    console.error("List conversations error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
    });
  }
};

exports.createConversation = async (req, res) => {
  try {
    const { participantId } = req.body || {};
    if (
      typeof participantId !== "string" ||
      !mongoose.isValidObjectId(participantId) ||
      participantId === String(req.user.userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid conversation participant is required",
      });
    }

    const participant = await User.findOne({
      _id: participantId,
      isActive: true,
    }).select("_id name profileImage");
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: "Conversation participant not found",
      });
    }

    const eligible = await Request.exists({
      status: "accepted",
      $or: [
        { sender: req.user.userId, receiver: participantId },
        { sender: participantId, receiver: req.user.userId },
      ],
    });
    if (!eligible) {
      return res.status(403).json({
        success: false,
        message: "You can message users after a connection request is accepted",
      });
    }

    const participants = [req.user.userId, participantId].sort();
    let conversation = await Conversation.findOne({
      participants: { $all: participants, $size: 2 },
    }).populate("participants", "name profileImage");

    if (!conversation) {
      conversation = await Conversation.create({ participants });
      conversation = await Conversation.findById(conversation._id).populate(
        "participants",
        "name profileImage"
      );
    }

    return res.status(201).json({
      success: true,
      conversation: {
        id: conversation._id,
        participants: conversation.participants,
      },
    });
  } catch (error) {
    console.error("Create conversation error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to create conversation",
    });
  }
};

exports.getMessages = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid conversation ID" });
    }
    const conversation = await getConversationForUser(
      req.params.id,
      req.user.userId
    );
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const messages = await Message.find({ conversation: conversation._id }).sort({
      createdAt: 1,
    });
    await Message.updateMany(
      {
        conversation: conversation._id,
        recipient: req.user.userId,
        deliveredAt: null,
      },
      { $set: { deliveredAt: new Date() } }
    );

    return res.json({
      success: true,
      conversationId: conversation._id,
      messages: messages.map(serializeMessage),
    });
  } catch (error) {
    console.error("Get conversation messages error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { content, clientMessageId } = req.body || {};
    const trimmedContent = typeof content === "string" ? content.trim() : "";
    if (!trimmedContent || trimmedContent.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Message must contain 1-${MAX_MESSAGE_LENGTH} characters`,
      });
    }
    if (clientMessageId !== undefined && typeof clientMessageId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid client message ID",
      });
    }

    const conversation = await getConversationForUser(
      req.params.id,
      req.user.userId
    );
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const recipientId = conversation.participants.find(
      (participant) => String(participant) !== String(req.user.userId)
    );
    if (!recipientId) {
      return res.status(409).json({
        success: false,
        message: "Conversation must have two participants",
      });
    }

    if (clientMessageId) {
      const existing = await Message.findOne({
        conversation: conversation._id,
        clientMessageId,
      });
      if (existing) {
        return res.status(200).json({ success: true, message: serializeMessage(existing) });
      }
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user.userId,
      recipient: recipientId,
      content: trimmedContent,
      clientMessageId,
    });
    await Conversation.updateOne(
      { _id: conversation._id },
      { $set: { lastMessage: message._id }, $currentDate: { updatedAt: true } }
    );

    try {
      await Notification.create({
        user: recipientId,
        type: "message",
        title: "New message",
        message: trimmedContent.slice(0, 100),
      });
    } catch (notificationError) {
      console.error("Create message notification error:", notificationError.message);
    }

    return res.status(201).json({
      success: true,
      message: serializeMessage(message),
    });
  } catch (error) {
    if (error?.code === 11000) {
      const existing = await Message.findOne({
        conversation: req.params.id,
        clientMessageId: req.body?.clientMessageId,
      });
      if (existing) {
        return res.status(200).json({ success: true, message: serializeMessage(existing) });
      }
    }
    console.error("Send conversation message error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};

exports.markMessagesRead = async (req, res) => {
  try {
    const conversation = await getConversationForUser(
      req.params.id,
      req.user.userId
    );
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }
    const readAt = new Date();
    const result = await Message.updateMany(
      {
        conversation: conversation._id,
        recipient: req.user.userId,
        readAt: null,
      },
      { $set: { readAt, deliveredAt: readAt } }
    );
    return res.json({ success: true, markedRead: result.modifiedCount });
  } catch (error) {
    console.error("Mark conversation messages read error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
    });
  }
};
