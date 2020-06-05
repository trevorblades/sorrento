import NextButton from './NextButton';
import PropTypes from 'prop-types';
import React from 'react';
import RemoveButton from './RemoveButton';
import ServeButton from './ServeButton';
import Timer from './Timer';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import {Box, List, ListItem, Stack, Text} from '@chakra-ui/core';
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
    <>
      <List>
        {props.customers.map((customer, index) => (
          <ListItem
            px={[5, 6]}
            py={[3, 4]}
            borderTopWidth={index && '1px'}
            key={customer.id}
          >
            <Text fontSize="xl" fontWeight="medium">
              {index + 1}. {format('(NNN) NNN-NNNN', customer.phone.slice(2))}
            </Text>
            <Text>{customer.name}</Text>
            <Stack align="center" isInline spacing="2" mt="3">
              <ServeButton
                mutationOptions={{
                  variables: {
                    id: customer.id
                  }
                }}
              />
              <RemoveButton customer={customer} />
              <Text fontSize="sm" color="gray.500">
                <Timer date={new Date(customer.waitingSince)} />
              </Text>
            </Stack>
          </ListItem>
        ))}
      </List>
      <NextButton
        isDisabled={!props.customers.length}
        mutationOptions={{
          variables: {
            id: props.customers[0]?.id
          }
        }}
      />
    </>
  );
}

Waitlist.propTypes = {
  subscribeToMore: PropTypes.func.isRequired,
  customers: PropTypes.array.isRequired
};
