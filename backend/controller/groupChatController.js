const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.name || !req.body.users) {
    return res.status(400).send("Please fill all details");
  }

  var usersList = JSON.parse(req.body.users);

  if (usersList.length < 2) {
    return res.status(400).send("More than 2 users are required for group!!");
  }

  usersList.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: usersList,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

const renameGroupChat = asyncHandler(async (req, res) => {
  const { chatId, chatNewName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatNewName,
    },
    {
      new: true, // Otherwise "updatedChat" will have old name
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(400).send("Chat Not found");
  } else {
    res.status(200).json(updatedChat);
  }
});

const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(400).send("Chat Not found");
  } else {
    res.status(200).json(added);
  }
});

const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(400).send("Chat Not found");
  } else {
    res.status(200).json(removed);
  }
});

module.exports = {
  createGroupChat,
  renameGroupChat,
  addToGroup,
  removeFromGroup,
};
