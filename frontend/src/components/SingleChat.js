import React, { useEffect, useState } from "react";
import { ChatState } from "../context/chatContext";
import {
  Box,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { getSender, getSenderProfile } from "../config/ChatLogics";
import ProfileModal from "./Miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./Miscellaneous/UpdateGroupChatModal";
import axios from "axios";
import "./styles.css";
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client";
import Lottie from "react-lottie";
import animationData from "../animation/typing";

const ENDPOINT = "http://cheat-chat.onrender.com";
// const ENDPOINT = "http://3.110.183.17:8080/chat";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sockedConnected, setSockedConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const toast = useToast();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    renderSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    console.log("Creating socket for user");
    socket = io(ENDPOINT);

    socket.emit("setup", user);
    socket.on("Connected", () => {
      console.log("Connected!!");
      setSockedConnected(true);
    });

    socket.on("Typing", () => {
      setIsTyping(true);
    });

    socket.on("Stop Typing", () => {
      setIsTyping(false);
    });
  }, []);

  useEffect(() => {
    socket.on("Message Received", (newMessageReceived) => {
      if (!selectedChatCompare) {
        // No chat is selected
        return;
      }

      if (selectedChatCompare._id !== newMessageReceived.chat._id) {
        // New message is not for selected user
        // Give a notification to logged in user
        return;
      }

      setMessages([...messages, newMessageReceived]);
    });
  });

  const fetchMessages = async () => {
    if (!selectedChat) {
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `http://cheat-chat.onrender.com/api/message/${selectedChat._id}`,
        config
      );

      setLoading(false);
      setMessages(data);

      // Add the user to socket room
      socket.emit("Join Chat", selectedChat._id);

      console.log(data);
    } catch (error) {
      setLoading(false);
      toast({
        title: "Error occurred!!",
        description: error.message,
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const sendMessage = async (event) => {
    if (event.key !== "Enter") {
      return;
    }

    if (!newMessage) {
      return;
    }

    // User has stopped typing
    socket.on("Stop Typing", () => {
      setIsTyping(false);
    });

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-type": "application/json",
        },
      };

      setNewMessage("");
      const { data } = await axios.post(
        "http://cheat-chat.onrender.com/api/message",
        {
          content: newMessage,
          chatId: selectedChat._id,
        },
        config
      );

      // Send socket
      socket.emit("New Message", data);

      setMessages([...messages, data]);
    } catch (error) {
      toast({
        title: "Error occurred!!",
        description: error.message,
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!sockedConnected) {
      return;
    }
    console.log("Typing Handler");

    if (!typing) {
      setTyping(true);
      // Emit that user is typing
      socket.emit("Typing", selectedChat._id);
    }

    let lastTypingTime = new Date().getTime();
    let timer = 3000; // 3 sec

    setTimeout(() => {
      let currTime = new Date().getTime();

      if (currTime - lastTypingTime >= timer && typing) {
        socket.emit("Stop Typing", selectedChat._id);
        setTyping(false);
      }
    }, timer);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />

            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users).toUpperCase()}
                <ProfileModal
                  user={getSenderProfile(user, selectedChat.users)}
                ></ProfileModal>
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
            )}
          </Text>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}
            <div>
              <FormControl
                onKeyDown={sendMessage}
                id="first-name"
                isRequired
                mt={3}
              >
                {isTyping && (
                  <div>
                    <Lottie
                      options={defaultOptions}
                      width={70}
                      style={{ marginBottom: 15, marginLeft: 0 }}
                    />
                  </div>
                )}
                <Input
                  variant="filled"
                  bg="#E0E0E0"
                  placeholder="Enter a message.."
                  value={newMessage}
                  onChange={typingHandler}
                />
              </FormControl>
            </div>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
