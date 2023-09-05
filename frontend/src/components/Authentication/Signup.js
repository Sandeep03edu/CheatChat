import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pic, setPic] = useState(
    "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
  );
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const postPicture = (pics) => {
    setLoading(true);

    if (pics === undefined) {
      toast({
        title: "No picture selected!!",
        description: "No photo selected for DP",
        status: "error",
        duration: 9000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    console.log(pics);

    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      console.log("Uploading Image...");
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "sky-chat");
      data.append("cloud_name", "dqnfunpje");
      fetch("https://api.cloudinary.com/v1_1/dqnfunpje/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          setPic(data.url);
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    } else {
      toast({
        title: "Invalid Media",
        description: "Please select a valid picture",
        status: "error",
        duration: 9000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  const createAccount = async () => {
    setLoading(true);
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Please Fill all the Feilds",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords Do Not Match",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      const headerConfig = {
        headers: {
          "Content-type": "application/json",
        },
      };
      const { data } = await axios.post(
        "http://cheat-chat.onrender.com/api/user",
        {
          name,
          email,
          password,
          pic,
        },
        headerConfig
      );

      toast({
        title: "Registration Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      navigate("/chats");
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  return (
    <>
      <VStack spacing="5px">
        <FormControl id="first-name" isRequired>
          <FormLabel>Name</FormLabel>
          <Input
            placeholder="Enter your name"
            onChange={(e) => setName(e.target.value)}
          />
        </FormControl>

        <FormControl id="first-name" isRequired>
          <FormLabel>Email Id</FormLabel>
          <Input
            placeholder="Enter your email id"
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>

        <FormControl id="first-name" isRequired>
          <FormLabel>Password</FormLabel>
          <InputGroup>
            <Input
              type={show ? "text" : "password"}
              placeholder="Enter your Password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <InputRightElement width="4.5rem">
              <Button
                h="1.75rem"
                size="sm"
                onClick={() => {
                  setShow(!show);
                }}
              >
                {show ? "Hide" : "Show"}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>

        <FormControl id="first-name" isRequired>
          <FormLabel>Confirm Password</FormLabel>
          <InputGroup>
            <Input
              type={show ? "text" : "password"}
              placeholder="Confirm your Password"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <InputRightElement width="4.5rem">
              <Button
                h="1.75rem"
                size="sm"
                onClick={() => {
                  setShow(!show);
                }}
              >
                {show ? "Hide" : "Show"}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>

        <FormControl id="first-name" isRequired>
          <FormLabel>Profile Pic</FormLabel>
          <Input
            type="file"
            p={"1.5"}
            accept="image/*"
            onChange={(e) => {
              postPicture(e.target.files[0]);
              console.log(e.target);
            }}
          />
        </FormControl>

        <Button
          colorScheme="blue"
          width="100%"
          style={{ marginTop: 15 }}
          onClick={createAccount}
          isLoading={loading}
        >
          Sign Up
        </Button>
      </VStack>
    </>
  );
};

export default Signup;
