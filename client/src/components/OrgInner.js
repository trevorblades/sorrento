import AcceptingSwitch from './AcceptingSwitch';
import Header from './Header';
import PropTypes from 'prop-types';
import React from 'react';
import UserMenu from './UserMenu';
import Waitlist from './Waitlist';
import {Box, Spinner, Text} from '@chakra-ui/core';
import {WAITLIST_QUERY} from '../utils';
import {useQuery} from '@apollo/client';

export default function OrgInner({variables}) {
  const {data, loading, error, subscribeToMore} = useQuery(WAITLIST_QUERY, {
    variables
  });

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
        <AcceptingSwitch
          organization={data.organization}
          subscribeToMore={subscribeToMore}
        />
        <UserMenu user={data.me} />
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
  variables: PropTypes.object.isRequired
};
