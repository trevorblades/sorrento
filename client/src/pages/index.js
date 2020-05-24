import React from 'react';
import logo from '../assets/logo.svg';
import {Box, Flex, Heading, PseudoBox, Text} from '@chakra-ui/core';
import {Helmet} from 'react-helmet';
import {graphql, useStaticQuery} from 'gatsby';

function HomePageHeading(props) {
  return (
    <Heading as="h3" fontSize="5xl" textTransform="uppercase" {...props} />
  );
}

export default function Home() {
  const {allInstaNode} = useStaticQuery(
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
  );

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
        <HomePageHeading mb="8">2417 E Hastings St, Vancouver</HomePageHeading>
        <HomePageHeading>
          Tuesday-Saturday: 8 AM-6 PM
          <br />
          Sunday: 10 AM-3 PM
        </HomePageHeading>
      </Flex>
      <Box px="20" mb="120px">
        <HomePageHeading mb="8">Monday: Closed</HomePageHeading>
        <HomePageHeading>
          Join the waitlist
          <br />
          Text your name to (604) 330-8137
        </HomePageHeading>
      </Box>
      <Flex h="500px" overflow="hidden" bg="black">
        {allInstaNode.nodes.map(instaNode => (
          <PseudoBox
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
          </PseudoBox>
        ))}
      </Flex>
      <Box p="20" textAlign="center">
        <Text fontSize="2xl">
          &copy; {new Date().getFullYear()} Sorrento Barbers
        </Text>
      </Box>
    </>
  );
}
