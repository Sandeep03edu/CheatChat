const express = require("express");
const { protectUser } = require("../middlewares/authMiddleware");
const { accessChats, fetchChat } = require("../controller/chatController");
const {
  createGroupChat,
  renameGroupChat,
  addToGroup,
  removeFromGroup,
} = require("../controller/groupChatController");
const router = express.Router();

// Sending a chat message API
router.route("/").post(protectUser, accessChats);

// Fetching all chats API
router.route("/").get(protectUser, fetchChat);

// // Create group chat
router.route("/group").post(protectUser, createGroupChat);

// Rename group chat
router.route("/rename").put(protectUser, renameGroupChat);

// Add member to group
router.route("/groupadd").put(protectUser, addToGroup);

// Remove member from group
router.route("/groupremove").put(protectUser, removeFromGroup);

module.exports = router;
