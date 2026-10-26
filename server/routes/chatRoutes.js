const express = require("express");
const auth = require("../middleware/authMiddleware");
const { sendChatMessage } = require("../controllers/chatController");

const router = express.Router();

router.post("/", auth, sendChatMessage);

module.exports = router;
