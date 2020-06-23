import CreateOrgButton from './CreateOrgButton';
import CreateOrgForm from './CreateOrgForm';
import React, {useContext} from 'react';
import {Box, Button, Flex, Heading, Text} from '@chakra-ui/core';
import {Elements} from '@stripe/react-stripe-js';
import {Link as GatsbyLink} from 'gatsby';
import {UserContext} from '../utils';
import {loadStripe} from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.GATSBY_STRIPE_PUBLISHABLE_KEY);

export default function AppInner() {
  const {user, logOut, organizations} = useContext(UserContext);
  return (
    <Box w="full" maxW="containers.sm" m="auto">
      <Elements stripe={stripePromise}>
        {organizations.length ? (
          <Flex>
            {organizations.map(organization => (
              <Button
                as={GatsbyLink}
                to={`/app/org/${organization.id}`}
                key={organization.id}
              >
                {organization.name}
              </Button>
            ))}
            <CreateOrgButton />
          </Flex>
        ) : (
          <>
            <Heading fontSize="3xl">Create an organization</Heading>
            <CreateOrgForm />
          </>
        )}
      </Elements>
      <Flex align="center" justify="center">
        <Text>Logged in as {user.name}</Text>
        <Button onClick={logOut}>Log out</Button>
      </Flex>
    </Box>
  );
}
