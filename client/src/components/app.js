import AppInner from './app-inner';
import React from 'react';
import {Box, Spinner, Text} from '@chakra-ui/core';
import {CUSTOMER_FRAGMENT, ORGANIZATION_FRAGMENT} from '../utils';
import {gql, useQuery} from '@apollo/client';

export default function App() {
  const {data, loading, error, subscribeToMore} = useQuery(gql`
    {
      user @client
      customers {
        ...CustomerFragment
      }
      organization {
        ...OrganizationFragment
      }
    }
    ${CUSTOMER_FRAGMENT}
    ${ORGANIZATION_FRAGMENT}
  `);

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

  return <AppInner data={data} subscribeToMore={subscribeToMore} />;
}
