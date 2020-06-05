import PropTypes from 'prop-types';
import React from 'react';
import {Box, Spinner, Text} from '@chakra-ui/core';
import {CUSTOMER_FRAGMENT} from '../utils';
import {gql, useQuery} from '@apollo/client';

const LIST_CUSTOMERS = gql`
  query ListCustomers {
    customers {
      ...CustomerFragment
    }
  }
  ${CUSTOMER_FRAGMENT}
`;

export default function ListCustomers(props) {
  const {data, loading, error, subscribeToMore} = useQuery(LIST_CUSTOMERS);

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

  return React.createElement(props.component, {
    customers: data.customers,
    subscribeToMore
  });
}

ListCustomers.propTypes = {
  component: PropTypes.func.isRequired
};
