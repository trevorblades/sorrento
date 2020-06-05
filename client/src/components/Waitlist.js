import NextButton from './NextButton';
import PropTypes from 'prop-types';
import React from 'react';
import RemoveButton from './RemoveButton';
import ServeButton from './ServeButton';
import Timer from './Timer';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import {Box, Flex, List, ListItem, Text} from '@chakra-ui/core';
import {CUSTOMER_FRAGMENT, ON_CUSTOMER_SERVED} from '../utils';
import {format} from 'phone-fns';
import {gql} from '@apollo/client';

const ON_CUSTOMER_REMOVED = gql`
  subscription OnCustomerRemoved {
    customerRemoved {
      ...CustomerFragment
    }
  }
  ${CUSTOMER_FRAGMENT}
`;

function updateQuery(prev, {subscriptionData}) {
  const {customerServed, customerRemoved} = subscriptionData.data;
  return {
    ...prev,
    customers: prev.customers.filter(
      customer => customer.id !== (customerServed || customerRemoved).id
    )
  };
}

export default function Waitlist(props) {
  useEffectOnce(() =>
    props.subscribeToMore({
      document: ON_CUSTOMER_SERVED,
      updateQuery
    })
  );

  useEffectOnce(() =>
    props.subscribeToMore({
      document: ON_CUSTOMER_REMOVED,
      updateQuery
    })
  );

  return (
    <Flex flexGrow="1" direction="column">
      <Box p={[4, 6, 8]}>
        <List spacing="6">
          {props.customers.map((customer, index) => (
            <ListItem key={customer.id}>
              <Box mb="2">
                <Text lineHeight="normal" fontSize="xl" fontWeight="medium">
                  {index + 1}.{' '}
                  {format('C (NNN) NNN-NNNN', customer.phone.slice(1))}
                </Text>
                <Text>
                  {customer.name} &bull;{' '}
                  <Timer date={new Date(customer.waitingSince)} />
                </Text>
              </Box>
              <ServeButton customer={customer} />
              <RemoveButton customer={customer} />
            </ListItem>
          ))}
        </List>
      </Box>
      <NextButton
        isDisabled={!props.customers.length}
        mutationOptions={{
          variables: {
            id: props.customers[0]?.id
          }
        }}
      />
    </Flex>
  );
}

Waitlist.propTypes = {
  subscribeToMore: PropTypes.func.isRequired,
  customers: PropTypes.array.isRequired
};
