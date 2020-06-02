import AppInner from './app-inner';
import React from 'react';
import {Box, Spinner, Text} from '@chakra-ui/core';
import {gql, useQuery} from '@apollo/client';

export default function App() {
  const {data, loading, error, subscribeToMore} = useQuery(gql`
    {
      user @client
      customers {
        id
        name
        waitingSince
        servedAt
      }
      organization {
        id
        accepting
      }
    }
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
