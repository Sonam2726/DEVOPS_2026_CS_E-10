const assert = require("node:assert/strict");
const { describe, it } = require("node:test");

const conversationController = require("../controllers/conversationController");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const Request = require("../models/Request");
const User = require("../models/User");

const userId = "507f1f77bcf86cd799439011";
const otherUserId = "507f1f77bcf86cd799439012";
const conversationId = "507f1f77bcf86cd799439013";

const response = () => {
  const result = {};
  return {
    result,
    status(code) {
      result.status = code;
      return this;
    },
    json(body) {
      result.body = body;
      return this;
    },
  };
};

const request = (overrides = {}) => ({
  body: {},
  params: {},
  user: { userId },
  ...overrides,
});

describe("conversation authorization and persistence", () => {
  it("does not create a conversation before an accepted request", async (t) => {
    t.mock.method(User, "findOne", () => ({
      select: () => Promise.resolve({ _id: otherUserId, name: "Other User" }),
    }));
    t.mock.method(Request, "exists", () => Promise.resolve(false));

    const res = response();
    await conversationController.createConversation(
      request({ body: { participantId: otherUserId } }),
      res
    );

    assert.equal(res.result.status, 403);
    assert.equal(res.result.body.success, false);
  });

  it("rejects reading messages from a conversation the user does not join", async (t) => {
    t.mock.method(Conversation, "findOne", () => Promise.resolve(null));

    const res = response();
    await conversationController.getMessages(
      request({ params: { id: conversationId } }),
      res
    );

    assert.equal(res.result.status, 404);
    assert.equal(res.result.body.success, false);
  });

  it("persists a message, updates the latest message, and creates a notification", async (t) => {
    const message = {
      _id: "507f1f77bcf86cd799439014",
      conversation: conversationId,
      sender: userId,
      recipient: otherUserId,
      content: "Hello",
      createdAt: new Date(),
      deliveredAt: null,
      readAt: null,
    };
    const conversation = {
      _id: conversationId,
      participants: [userId, otherUserId],
    };
    t.mock.method(Conversation, "findOne", () => Promise.resolve(conversation));
    t.mock.method(Message, "findOne", () => Promise.resolve(null));
    const createMessage = t.mock.method(Message, "create", () => Promise.resolve(message));
    const updateConversation = t.mock.method(
      Conversation,
      "updateOne",
      () => Promise.resolve({ modifiedCount: 1 })
    );
    const createNotification = t.mock.method(
      Notification,
      "create",
      () => Promise.resolve({})
    );

    const res = response();
    await conversationController.sendMessage(
      request({
        params: { id: conversationId },
        body: { content: " Hello ", clientMessageId: "client-1" },
      }),
      res
    );

    assert.equal(res.result.status, 201);
    assert.equal(res.result.body.message.content, "Hello");
    assert.equal(createMessage.mock.calls[0].arguments[0].recipient, otherUserId);
    assert.equal(updateConversation.mock.calls[0].arguments[1].$set.lastMessage, message._id);
    assert.equal(createNotification.mock.calls[0].arguments[0].user, otherUserId);
  });

  it("marks only unread messages in the selected conversation as read", async (t) => {
    t.mock.method(Conversation, "findOne", () =>
      Promise.resolve({ _id: conversationId, participants: [userId, otherUserId] })
    );
    const updateMessages = t.mock.method(
      Message,
      "updateMany",
      () => Promise.resolve({ modifiedCount: 2 })
    );

    const res = response();
    await conversationController.markMessagesRead(
      request({ params: { id: conversationId } }),
      res
    );

    assert.equal(res.result.status, undefined);
    assert.equal(res.result.body.markedRead, 2);
    assert.deepEqual(updateMessages.mock.calls[0].arguments[0], {
      conversation: conversationId,
      recipient: userId,
      readAt: null,
    });
  });
});
