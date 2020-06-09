import NextButton from './NextButton';
import PropTypes from 'prop-types';
import React from 'react';
import RemoveButton from './RemoveButton';
import ServeButton from './ServeButton';
import Timer from './Timer';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import {Box, Flex, List, ListItem, Stack, Text} from '@chakra-ui/core';
import {CUSTOMER_FRAGMENT, ON_CUSTOMER_SERVED} from '../utils';
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

export default function Waitlist(props) {
  useEffectOnce(() =>
    props.subscribeToMore({
      document: ON_CUSTOMER_ADDED,
      updateQuery(prev, {subscriptionData}) {
        return {
          ...prev,
          customers: [subscriptionData.data.customerAdded, ...prev.customers]
        };
      }
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
      <List spacing={[5, 6]} py={[4, 5]} px={[5, 6]} position="relative">
        {props.customers.map((customer, index) => (
          <ListItem mx="auto" maxW="containers.lg" key={customer.id}>
            <Box>
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
        <Flex
          maxW="containers.lg"
          mx="auto"
          align="center"
          justify="space-between"
        >
          <Box mr="4" overflow="hidden">
            <Text color="gray.500" fontWeight="medium" fontSize="sm">
              Now serving
            </Text>
            <Text isTruncated>
              Trevoolkjsd flkjdfs alkjds falkdfs ajlkdajs lk sajo
            </Text>
          </Box>
          <NextButton
            size="lg"
            rounded="full"
            variantColor="green"
            rightIcon={FaArrowRight}
            flexShrink="0"
            isDisabled={!props.customers.length}
            mutationOptions={{
              variables: {
                id: props.customers[0]?.id
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
  customers: PropTypes.array.isRequired
};
