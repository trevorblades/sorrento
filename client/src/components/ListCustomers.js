import PropTypes from 'prop-types';
import React from 'react';
import {Box, Spinner, Text} from '@chakra-ui/core';
import {LIST_CUSTOMERS} from '../utils';
import {useQuery} from '@apollo/client';

export default function ListCustomers({served, component}) {
  const {data, loading, error, subscribeToMore} = useQuery(LIST_CUSTOMERS, {
    variables: {served},
    fetchPolicy: 'network-only'
  });

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

  return React.createElement(component, {
    data,
    subscribeToMore
  });
}

ListCustomers.propTypes = {
  component: PropTypes.func.isRequired,
  served: PropTypes.bool.isRequired
};
