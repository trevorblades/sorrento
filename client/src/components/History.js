import PropTypes from 'prop-types';
import React from 'react';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import {Box, List, ListItem, Text} from '@chakra-ui/core';
import {Helmet} from 'react-helmet';
import {ON_CUSTOMER_SERVED} from '../utils';
import {format} from 'date-fns';

export default function History(props) {
  useEffectOnce(() =>
    props.subscribeToMore({
      document: ON_CUSTOMER_SERVED,
      updateQuery(prev, {subscriptionData}) {
        return {
          ...prev,
          customers: [subscriptionData.data.customerServed, ...prev.customers]
        };
      }
    })
  );

  return (
    <Box p={[4, 5, 6]}>
      <Helmet>
        <title>Customer history</title>
      </Helmet>
      <List spacing="4">
        {props.customers.map(customer => (
          <ListItem key={customer.id}>
            <Text>{customer.name}</Text>
            <Text color="gray.500">
              {format(new Date(customer.servedAt), 'Pp')}
            </Text>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

History.propTypes = {
  customers: PropTypes.array.isRequired,
  subscribeToMore: PropTypes.func.isRequired
};
