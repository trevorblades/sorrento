import AcceptingSwitch from './AcceptingSwitch';
import Header from './Header';
import PropTypes from 'prop-types';
import React from 'react';
import UserMenu from './UserMenu';
import Waitlist from './Waitlist';
import {Box, Flex, Spinner, Text} from '@chakra-ui/core';
import {WAITLIST_QUERY} from '../utils';
import {useQuery} from '@apollo/client';

export default function OrgInner({queryOptions}) {
  const {data, loading, error, subscribeToMore} = useQuery(
    WAITLIST_QUERY,
    queryOptions
  );

  if (loading) {
    return (
      <Box m="auto">
        <Spinner />
      </Box>
    );
  }

  if (error) {
    return <Text color="red.500">{error.message}</Text>;
  }

  return (
    <>
      <Header>
        <Flex mr="6" align="center" color="white">
          <Text mr="2">{data.organization.accepting ? 'On' : 'Off'}</Text>
          <AcceptingSwitch
            organization={data.organization}
            subscribeToMore={subscribeToMore}
          />
        </Flex>
        <UserMenu user={data.me} organization={data.organization} />
      </Header>
      <Waitlist
        customers={data.organization.customers}
        nowServing={data.me.nowServing}
        subscribeToMore={subscribeToMore}
      />
    </>
  );
}

OrgInner.propTypes = {
  queryOptions: PropTypes.object.isRequired
};
