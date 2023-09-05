const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,
} = require("../controller/userController");
const { protectUser } = require("../middlewares/authMiddleware");
const router = express.Router();

// Multiple type of requests at a time
// router.route("/login").get(()=>{}).post(()=>{})

router.route("/").post(registerUser).get(protectUser, allUsers);
// router.post("/", registerUser);

router.post("/login", authUser);

module.exports = router;
