import React from "react";
import logo from "../assets/logo.svg";
import { Box, Flex, Heading, Text } from "@chakra-ui/react";

export default function HomePage() {
  return (
    <>
      <Flex
        direction="column"
        justify="flex-end"
        color="white"
        bg="red.500"
        px="20"
      >
        <Box mt="200px" mb="16" maxW="599px" as="img" src={logo.src} />
        <Heading fontSize="5xl" mb="8">
          2417 E Hastings St, Vancouver
        </Heading>
        <Heading fontSize="5xl">
          Monday: 10 AM - 5 PM
          <br />
          Tuesday - Saturday: 8 AM - 6 PM
        </Heading>
      </Flex>
      <Box px="20" mb="120px">
        <Heading fontSize="5xl" mb="8">
          Sunday: 10 AM - 3 PM
        </Heading>
        <Heading fontSize="5xl">
          Join the waitlist
          <br />
          Text your name to (604) 330-8137
        </Heading>
      </Box>
      <Box p="20" textAlign="center">
        <Text fontSize="2xl">
          &copy; {new Date().getFullYear()} Sorrento Barbers
        </Text>
      </Box>
    </>
  );
}
