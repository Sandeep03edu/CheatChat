const mongoose = require("mongoose");

const chatModel = mongoose.Schema(
  {
    chatName: {
      type: String,
      trim: true,
    },
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    users: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    latestMessage: {
      type: mongoose.Schema.ObjectId,
      ref: "Message",
    },
    groupAdmin: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  {
    timeStamps: true,
  }
);

const chat = mongoose.model("Chat", chatModel);

module.exports = chat;
