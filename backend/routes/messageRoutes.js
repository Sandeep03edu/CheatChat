const express = require("express");
const router = express.Router();
const { protectUser } = require("../middlewares/authMiddleware");
const { sendMessage, allMessages } = require("../controller/messageController");

router.route("/").post(protectUser, sendMessage);
router.route("/:chatId").get(protectUser, allMessages);

module.exports = router;
