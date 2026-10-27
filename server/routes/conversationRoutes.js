const express = require("express");
const auth = require("../middleware/authMiddleware");
const {
  listConversations,
  createConversation,
  getMessages,
  sendMessage,
  markMessagesRead,
} = require("../controllers/conversationController");

const router = express.Router();

router.use(auth);
router.get("/", listConversations);
router.post("/", createConversation);
router.get("/:id/messages", getMessages);
router.post("/:id/messages", sendMessage);
router.patch("/:id/read", markMessagesRead);

module.exports = router;
