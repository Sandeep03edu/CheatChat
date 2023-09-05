const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const accessChats = asyncHandler(async (req, res) => {
  // User id with with logged in user wants to chat
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent");
    return res.sendStatus(400);
  }

  // Getting all chats of loggedIn user and req body user
  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    //   Populate chat model's "users" field with all details
    .populate("users", "-password")
    //   Populate chat model's "latestMessage" field with last message
    .populate("latestMessage");

  // Get the latest message user complete detail
  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    // Chat with user exist
    return res.send(isChat[0]);
  } else {
    // Create new chat with user
    var chatData = {
      chatName: "Sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createChat = await Chat.create(chatData);

      const fullChat = await Chat.findOne({ _id: createChat._id }).populate(
        "users",
        "-password"
      );

      res.status(200).send(fullChat);
    } catch (err) {
      return res.status(400).send(err.message);
    }
  }
});

const fetchChat = asyncHandler(async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (result) => {
        // Get the latest message user complete detail
        result = await User.populate(result, {
          path: "latestMessage.sender",
          select: "name pic email",
        });

        res.status(200).send(result);
      });
  } catch (err) {
    res.send(err.message).status(404);
  }
});

module.exports = { accessChats, fetchChat };
