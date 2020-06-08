import Layout from '../components/Layout';
import React from 'react';
import {Box, Button, Flex, Heading} from '@chakra-ui/core';
import {Link as GatsbyLink} from 'gatsby';

export default function Home() {
  return (
    <Layout>
      <Flex minH="100vh">
        <Box p="10" my="auto">
          <Heading mb="2" fontSize="4xl">
            🎱 W8UP
          </Heading>
          <Heading mb="6" fontSize="6xl">
            Low tech, SMS-based waitlist
          </Heading>
          <Button as={GatsbyLink} to="/app" size="lg" variantColor="green">
            Log in
          </Button>
        </Box>
      </Flex>
    </Layout>
  );
}
