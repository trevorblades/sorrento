import PropTypes from 'prop-types';
import React from 'react';
import groupBy from 'lodash.groupby';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import {Box, Heading, useTheme} from '@chakra-ui/core';
import {Helmet} from 'react-helmet';
import {ON_CUSTOMER_SERVED} from '../utils';
import {ResponsiveLine} from '@nivo/line';
import {format} from 'date-fns';

function TableHeader(props) {
  return <Box as="th" textAlign="left" fontWeight="medium" {...props} />;
}

export default function History(props) {
  const {customers} = props.data;
  const {colors} = useTheme();

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
      new Date(customer.servedAt).toLocaleDateString('sv')
    )
  ).map(([x, {length: y}]) => ({x, y}));

  const maxY = Math.max(...data.map(({y}) => y));

  return (
    <Box p={[5, 6]}>
      <Helmet>
        <title>Customer history</title>
      </Helmet>
      <Box maxW="containers.lg" mx="auto">
        <Heading mb="4" fontSize="2xl">
          Last 7 days
        </Heading>
        <Box h="300px" mb="4">
          <ResponsiveLine
            colors={[colors.green[500]]}
            gridYValues={maxY}
            axisLeft={{tickValues: maxY}}
            axisBottom={{
              format: '%b %d',
              tickValues: 'every day'
            }}
            xScale={{
              type: 'time',
              format: '%Y-%m-%d',
              useUTC: false
            }}
            margin={{top: 24, right: 24, bottom: 24, left: 24}}
            data={[
              {
                id: 'customers',
                data
              }
            ]}
          />
        </Box>
        <Box as="table" w="full" flexShrink="0" lineHeight="taller">
          <thead>
            <tr>
              <TableHeader>Name</TableHeader>
              <TableHeader>Served by</TableHeader>
              <TableHeader textAlign="right">Served at</TableHeader>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer, index) => (
              <Box
                as="tr"
                bg={index % 2 ? undefined : 'gray.50'}
                key={customer.id}
              >
                <td>{customer.name}</td>
                <td>{customer.servedBy.name}</td>
                <Box as="td" textAlign="right">
                  {format(new Date(customer.servedAt), 'Pp')}
                </Box>
              </Box>
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
