import Header from '../../components/Header';
import Layout from '../../components/Layout';
import PropTypes from 'prop-types';
import React from 'react';
import RequireAuth from '../../components/RequireAuth';
import {Box, Spinner, Text} from '@chakra-ui/core';
import {gql, useQuery} from '@apollo/client';

const GET_ORGANIZATION = gql`
  query GetOrganization($id: ID!) {
    organization(id: $id) {
      name
      customers(served: false) {
        id
        name
        phone
      }
    }
  }
`;

function OrgInner({variables}) {
  const {data, loading, error} = useQuery(GET_ORGANIZATION, {variables});

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
      <Header />
      <div>
        {data.organization.name} {data.organization.customers.length}
      </div>
    </>
  );
}

OrgInner.propTypes = {
  variables: PropTypes.object.isRequired
};

export default function Org(props) {
  return (
    <Layout>
      <RequireAuth>
        <OrgInner variables={{id: props['*']}} />
      </RequireAuth>
    </Layout>
  );
}

Org.propTypes = {
  '*': PropTypes.string.isRequired
};
