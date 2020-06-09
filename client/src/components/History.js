import PropTypes from 'prop-types';
import React from 'react';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import {
  Box,
  Heading,
  Stat,
  StatArrow,
  StatHelpText,
  StatLabel,
  StatNumber
} from '@chakra-ui/core';
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
    <Box p={[5, 6]}>
      <Helmet>
        <title>Customer history</title>
      </Helmet>
      <Box
        maxW="containers.lg"
        mx="auto"
        display={{md: 'grid'}}
        gridTemplateColumns="1fr 2fr"
      >
        <Box>
          <Heading fontSize="2xl" mb="4">
            Last 7 days
          </Heading>
          <Stat>
            <StatLabel>Customers served</StatLabel>
            <StatNumber>{props.customers.length}</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              10%
            </StatHelpText>
          </Stat>
        </Box>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Served by</th>
              <th>Served at</th>
            </tr>
          </thead>
          <tbody>
            {props.customers.map(customer => (
              <tr key={customer.id}>
                <td>{customer.name}</td>
                <td>{customer.servedBy.name}</td>
                <td>{format(new Date(customer.servedAt), 'Pp')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Box>
  );
}

History.propTypes = {
  customers: PropTypes.array.isRequired,
  subscribeToMore: PropTypes.func.isRequired
};
