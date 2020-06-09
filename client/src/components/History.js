import PropTypes from 'prop-types';
import React from 'react';
import groupBy from 'lodash.groupby';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import {Box, Heading} from '@chakra-ui/core';
import {Helmet} from 'react-helmet';
import {ON_CUSTOMER_SERVED} from '../utils';
import {ResponsiveLine} from '@nivo/line';
import {format} from 'date-fns';

export default function History(props) {
  const {customers} = props.data;

  useEffectOnce(() =>
    props.subscribeToMore({
      document: ON_CUSTOMER_SERVED,
      updateQuery: (prev, {subscriptionData}) => ({
        ...prev,
        customers: [subscriptionData.data.customerServed, ...prev.customers]
      })
    })
  );

  const data = Object.entries(
    groupBy(customers, customer =>
      new Date(customer.servedAt).toLocaleDateString()
    )
  ).map(([x, {length: y}]) => ({x, y}));

  const maxY = Math.max(...data.map(({y}) => y));

  return (
    <Box p={[5, 6]}>
      <Helmet>
        <title>Customer history</title>
      </Helmet>
      <Box
        maxW="containers.lg"
        mx="auto"
        display={{md: 'grid'}}
        gridTemplateColumns="1fr 1fr"
      >
        <Box minW="0">
          <Heading fontSize="2xl">Last 7 days</Heading>
          <Box h="300px">
            <ResponsiveLine
              gridYValues={maxY}
              axisLeft={{tickValues: maxY}}
              margin={{top: 40, right: 40, bottom: 40, left: 40}}
              data={[
                {
                  id: 'customers',
                  data
                }
              ]}
            />
          </Box>
        </Box>
        <Box as="table" w="full" flexShrink="0">
          <thead>
            <tr>
              <th>Name</th>
              <th>Served by</th>
              <th>Served at</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer.id}>
                <td>{customer.name}</td>
                <td>{customer.servedBy.name}</td>
                <Box as="td" textAlign="right">
                  {format(new Date(customer.servedAt), 'Pp')}
                </Box>
              </tr>
            ))}
          </tbody>
        </Box>
      </Box>
    </Box>
  );
}

History.propTypes = {
  data: PropTypes.object.isRequired,
  subscribeToMore: PropTypes.func.isRequired
};
