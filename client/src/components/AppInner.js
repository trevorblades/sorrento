import CreateOrgButton from './CreateOrgButton';
import CreateOrgForm from './CreateOrgForm';
import React from 'react';
import UserStatus from './UserStatus';
import {Box, Button, Flex, Heading, Spinner, Text} from '@chakra-ui/core';
import {Elements} from '@stripe/react-stripe-js';
import {Link as GatsbyLink} from 'gatsby';
import {LIST_ORGANIZATIONS} from '../utils';
import {loadStripe} from '@stripe/stripe-js';
import {useQuery} from '@apollo/client';

const stripePromise = loadStripe(process.env.GATSBY_STRIPE_PUBLISHABLE_KEY);

export default function AppInner() {
  const {data, loading, error} = useQuery(LIST_ORGANIZATIONS);

  if (loading) {
    return (
      <Box m="auto">
        <Spinner />
      </Box>
    );
  }

  if (error) {
    return <Text color="red.500">{error.message}</Text>;
  }

  return (
    <Box w="full" maxW="containers.sm" m="auto">
      <Elements stripe={stripePromise}>
        {data.organizations.length ? (
          <Flex>
            {data.organizations.map(organization => (
              <Button
                as={GatsbyLink}
                to={`/app/o/${organization.id}`}
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
      <UserStatus user={data.me} />
    </Box>
  );
}
