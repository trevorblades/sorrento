import NextButton from './NextButton';
import PropTypes from 'prop-types';
import React from 'react';
import RemoveButton from './RemoveButton';
import ServeButton from './ServeButton';
import Timer from './Timer';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import {Box, Flex, List, ListItem, Stack, Text} from '@chakra-ui/core';
import {CUSTOMER_FRAGMENT, LIST_CUSTOMERS, ON_CUSTOMER_SERVED} from '../utils';
import {FaArrowRight} from 'react-icons/fa';
import {format} from 'phone-fns';
import {gql} from '@apollo/client';

const ON_CUSTOMER_ADDED = gql`
  subscription OnCustomerAdded {
    customerAdded {
      ...CustomerFragment
    }
  }
  ${CUSTOMER_FRAGMENT}
`;

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

function update(cache, {data}) {
  const queryOptions = {
    query: LIST_CUSTOMERS,
    variables: {
      served: false
    }
  };

  const {customers} = cache.readQuery(queryOptions);
  cache.writeQuery({
    ...queryOptions,
    data: {
      customers,
      nowServing: data.serveCustomer
    }
  });
}

export default function Waitlist(props) {
  const {nowServing, customers} = props.data;

  useEffectOnce(() =>
    props.subscribeToMore({
      document: ON_CUSTOMER_ADDED,
      updateQuery: (prev, {subscriptionData}) => ({
        ...prev,
        customers: [subscriptionData.data.customerAdded, ...prev.customers]
      })
    })
  );

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
      <List position="relative">
        {customers.map((customer, index) => (
          <ListItem
            mx="auto"
            px={{lg: 6}}
            boxSizing="content-box"
            maxW="containers.lg"
            key={customer.id}
          >
            <Box
              py={[3, 4]}
              px={{
                base: 5,
                sm: 6,
                lg: 0
              }}
              borderTopWidth={index && '1px'}
            >
              <Text fontSize="xl" fontWeight="medium">
                {index + 1}. {format('(NNN) NNN-NNNN', customer.phone.slice(2))}
              </Text>
              <Text>{customer.name}</Text>
              <Stack align="center" isInline spacing="2" mt="3">
                <ServeButton
                  mutationOptions={{
                    update,
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
            </Box>
          </ListItem>
        ))}
      </List>
      <Box
        px="4"
        py="3"
        bg="gray.900"
        color="white"
        mt="auto"
        position="sticky"
        bottom="0"
      >
        <Flex maxW="containers.lg" mx="auto" align="center">
          {nowServing && (
            <Box mr="4" overflow="hidden">
              <Text color="gray.500" fontWeight="medium" fontSize="sm">
                Now serving
              </Text>
              <Text fontWeight="medium" isTruncated>
                {nowServing.name}
              </Text>
            </Box>
          )}
          <NextButton
            size="lg"
            rounded="full"
            variantColor="green"
            ml="auto"
            rightIcon={FaArrowRight}
            flexShrink="0"
            isDisabled={!customers.length}
            mutationOptions={{
              update,
              variables: {
                id: customers[0]?.id
              }
            }}
          />
        </Flex>
      </Box>
    </>
  );
}

Waitlist.propTypes = {
  subscribeToMore: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired
};
