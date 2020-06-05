import NextButton from './NextButton';
import PropTypes from 'prop-types';
import React, {useMemo} from 'react';
import RemoveButton from './RemoveButton';
import ServeButton from './ServeButton';
import Timer from './Timer';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import {Box, Flex, List, ListItem, Text} from '@chakra-ui/core';
import {CUSTOMER_FRAGMENT, ON_CUSTOMER_SERVED} from '../utils';
import {gql} from '@apollo/client';

function PanelListItem({title, subtitle, children, ...props}) {
  return (
    <Flex as={ListItem} justify="space-between" align="center" {...props}>
      <div>
        <Text lineHeight="normal" fontSize="2xl" fontWeight="medium">
          {title}
        </Text>
        <Text lineHeight="normal" fontSize="xl">
          {subtitle}
        </Text>
      </div>
      <Box flexShrink="0">{children}</Box>
    </Flex>
  );
}

PanelListItem.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired
};

const ON_CUSTOMER_REMOVED = gql`
  subscription OnCustomerRemoved {
    customerRemoved {
      ...CustomerFragment
    }
  }
  ${CUSTOMER_FRAGMENT}
`;

export default function Waitlist(props) {
  useEffectOnce(() =>
    props.subscribeToMore({
      document: ON_CUSTOMER_SERVED
    })
  );

  useEffectOnce(() =>
    props.subscribeToMore({
      document: ON_CUSTOMER_REMOVED,
      updateQuery: (prev, {subscriptionData}) => ({
        ...prev,
        customers: prev.customers.filter(
          customer => customer.id !== subscriptionData.data?.customerRemoved.id
        )
      })
    })
  );

  const waitingCustomers = useMemo(
    () =>
      props.customers
        .filter(customer => !customer.servedAt)
        .sort((a, b) => new Date(a.waitingSince) - new Date(b.waitingSince)),
    [props.customers]
  );

  return (
    <Flex flexGrow="1" direction="column">
      <Box p={[6, 8, 10]}>
        <List spacing="6">
          {waitingCustomers.map((customer, index) => (
            <PanelListItem
              key={customer.id}
              title={`${index + 1}. ${customer.name}`}
              subtitle={<Timer date={new Date(customer.waitingSince)} />}
            >
              <ServeButton customer={customer} />
              <RemoveButton customer={customer} />
            </PanelListItem>
          ))}
        </List>
      </Box>
      <NextButton
        isDisabled={!waitingCustomers.length}
        mutationOptions={{
          variables: {
            id: waitingCustomers[0]?.id
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
