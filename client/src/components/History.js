import PropTypes from 'prop-types';
import React, {useMemo} from 'react';
import {Box, List, ListItem, Text} from '@chakra-ui/core';
import {Helmet} from 'react-helmet';
import {format} from 'date-fns';

export default function History(props) {
  const servedCustomers = useMemo(
    () =>
      props.customers
        .filter(customer => customer.servedAt)
        .sort((a, b) => new Date(b.servedAt) - new Date(a.servedAt)),
    [props.customers]
  );

  return (
    <Box p={[4, 5, 6]}>
      <Helmet>
        <title>Customer history</title>
      </Helmet>
      <List spacing="4">
        {servedCustomers.map(customer => (
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
  customers: PropTypes.array.isRequired
};
