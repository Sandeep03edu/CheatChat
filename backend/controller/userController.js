const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateJWT = require("../config/generateJWT");

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please fill all the fields");
  }

  // CHeck whether user exist or not by email Id
  const userExist = await User.findOne({ email });

  if (userExist) {
    res.status(400);
    throw new Error("User already exists!!");
  }

  // Create new user
  const newUser = await User.create({
    name,
    email,
    password,
    pic,
  });

  if (newUser) {
    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      pic: newUser.pic,
      token: generateJWT(newUser._id),
    });
  } else {
    res.status(400);
    throw new Error("Something went wrong!!");
  }
});

// Authenticate User
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // CHeck whether user exist or not by email Id
  const userExist = await User.findOne({ email });

  if (userExist && (await userExist.matchPassword(password))) {
    res.status(201).json({
      _id: userExist._id,
      name: userExist.name,
      email: userExist.email,
      pic: userExist.pic,
      token: generateJWT(userExist._id),
    });
  } else {
    res.status(400);
    throw new Error("User doesn't exists!!");
  }
});

// Example - /api/user?search=Sandeep
const allUsers = asyncHandler(async (req, res) => {
  // Search keyword
  const keyword = req.query.search
    ? {
        // If keyword exist and is "undefined"
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {
        // Else case when "search" query is missing
      };

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } }); // Not the logged in user

  res.send(users);
});

module.exports = { registerUser, authUser, allUsers };
