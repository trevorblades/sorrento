import React from "react";
import logo from "../assets/logo.svg";
import { Box, Flex, Link, Stack, Text } from "@chakra-ui/react";

const PADDING = [6, 10, 20];
const SPACING = [4, 6, 8];

export default function HomePage() {
  return (
    <>
      <Box
        fontSize={["3xl", "4xl", "5xl"]}
        fontWeight="bold"
        lineHeight="short"
      >
        <Flex
          direction="column"
          justify="flex-end"
          color="white"
          bg="red.500"
          px={PADDING}
        >
          <Box
            mt={[20, 120, 200]}
            mb={{
              base: 12,
              md: 16,
            }}
            maxW="599px"
            as="img"
            src={logo.src}
          />
          <Stack spacing={SPACING}>
            <div>2417 E Hastings St, Vancouver</div>
            <div>
              Monday: 10 AM - 5:30 PM
              <br />
              Tuesday - Saturday: 8 AM - 5:30 PM
            </div>
          </Stack>
        </Flex>
        <Stack spacing={SPACING} px={PADDING} mb={[10, 20, 120]}>
          <div>Sunday: 10 AM - 3 PM</div>
          <div>
            Join the waitlist
            <br />
            Text your name to{" "}
            <Link href="tel:+16043308137">(604) 330-8137</Link>
          </div>
          <div>
            Contact us:{" "}
            <Link href="mailto:sorrentobarbers@gmail.com">
              fredlybarbering@gmail.com
            </Link>
          </div>
        </Stack>
      </Box>
      <Box p={PADDING} textAlign="center">
        <Text
          fontSize={{
            base: "xl",
            md: "2xl",
          }}
        >
          &copy; {new Date().getFullYear()} Sorrento Barbers
        </Text>
      </Box>
    </>
  );
}
