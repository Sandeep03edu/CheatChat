const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const connectDb = require("./config/db");
const chats = require("./data/data");
const color = require("colors");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");
const path = require("path");

dotenv.config();

connectDb();

const PORT = process.env.PORT;

app.use(cors());

// Accept JSON data
app.use(express.json());

const server = app.listen(
  PORT,
  console.log(`Server started on port ${PORT}!`.yellow.bold)
);

// User auth API
app.use("/api/user", userRoutes);

// chat API

// Dummy Chats
// app.get("/api/chat", (req, res) => {
//   res.send(chats);
// });

app.use("/api/chat", chatRoutes);

app.use("/api/message", messageRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// ************************* Socket.io connection *********************************
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
  },
  pingTimeout: 60000, // Amount of time socket will wait before disconnecting
});

io.on("connection", (socket) => {
  console.log("Connected to socket io".yellow.bold);

  // Create new socket from frontend data
  socket.on("setup", (userData) => {
    // Create room for each user
    socket.join(userData._id);
    console.log(`Socket creating for ${userData._id}`);
    socket.emit("Connected");
  });

  socket.on("Join Chat", (room) => {
    socket.join(room);
    console.log("User joined the room " + room);
  });

  socket.on("New Message", (newMessageReceived) => {
    var chat = newMessageReceived.chat;

    if (!chat.users) {
      console.log("chat.users DNE!!");
      return;
    }

    chat.users.forEach((user) => {
      if (user._id !== newMessageReceived.sender._id) {
        socket.in(user._id).emit("Message Received", newMessageReceived);
      }
    });
  });

  socket.on("Typing", (room) => {
    socket.in(room).emit("Typing");
  });

  socket.on("Stop Typing", (room) => {
    socket.in(room).emit("Stop Typing");
  });

  socket.off("setup", (userData) => {
    console.log(`Disconnecting User ${userData._id}`);
    socket.leave(userData._id);
  });
});

// ************************* Socket.io connection *********************************

// ************************* Deployement ******************************************

const _dirname_chat = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(_dirname_chat, "/frontend/build")));

  app.get("*", (req, res) => {
    console.log("Get runnning....");
    console.log(path.join(_dirname_chat, "frontend", "build", "index.html"));
    res.sendFile(path.join(_dirname_chat, "frontend", "build", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("Api running!!");
  });
}

// ************************* Deployement ******************************************
