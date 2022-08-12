import React from 'react';
import logo from '../assets/logo.svg';
import {Box, Flex, Heading, Text} from '@chakra-ui/core';
import {Helmet} from 'react-helmet';
// import {graphql, useStaticQuery} from 'gatsby';

export default function Home() {
  /* const {allInstaNode} = useStaticQuery(
    graphql`
      {
        allInstaNode(sort: {order: DESC, fields: timestamp}) {
          nodes {
            original
            id
            timestamp
          }
        }
      }
    `
  ); */

  return (
    <>
      <Helmet>
        <title>Sorrento Barbers</title>
      </Helmet>
      <Flex
        direction="column"
        justify="flex-end"
        color="white"
        bg="red.500"
        px="20"
      >
        <Box mt="200px" mb="16" maxW="599px" as="img" src={logo} />
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
      {/* <Flex h="500px" overflow="hidden" bg="black">
        {allInstaNode.nodes.map((instaNode) => (
          <Box
            as="a"
            h="full"
            flexShrink="0"
            key={instaNode.id}
            href={`https://instagram.com/p/${instaNode.id}`}
            target="_blank"
            rel="noopener noreferrer"
            _hover={{opacity: 0.9}}
            _active={{opacity: 0.8}}
          >
            <Box as="img" h="full" loading="lazy" src={instaNode.original} />
          </Box>
        ))}
      </Flex> */}
      <Box p="20" textAlign="center">
        <Text fontSize="2xl">
          &copy; {new Date().getFullYear()} Sorrento Barbers
        </Text>
      </Box>
    </>
  );
}
