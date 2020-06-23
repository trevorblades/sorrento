import LoginForm from './LoginForm';
import PropTypes from 'prop-types';
import React from 'react';
import {Box, Flex, Spinner, Text} from '@chakra-ui/core';
import {Helmet} from 'react-helmet';
import {UserContext} from '../utils';
import {gql, useQuery} from '@apollo/client';

const GET_LOGGED_IN = gql`
  query GetLoggedIn {
    isLoggedIn @client
  }
`;

const GET_USER = gql`
  query GetUser {
    user: me {
      name
    }
    organizations {
      id
      name
    }
  }
`;

function LoggedIn(props) {
  const {data, loading, error, client} = useQuery(GET_USER);

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
    <UserContext.Provider
      value={{
        ...data,
        logOut() {
          localStorage.removeItem('sorrento:token');
          client.writeQuery({
            query: GET_LOGGED_IN,
            data: {
              isLoggedIn: false
            }
          });
        }
      }}
    >
      {props.children}
    </UserContext.Provider>
  );
}

LoggedIn.propTypes = {
  children: PropTypes.node.isRequired
};

export default function RequireAuth(props) {
  const {data, client} = useQuery(GET_LOGGED_IN);

  if (data?.isLoggedIn) {
    return (
      <Flex minH="100vh" direction="column">
        <LoggedIn>{props.children}</LoggedIn>
      </Flex>
    );
  }

  return (
    <>
      <Helmet>
        <title>Log in</title>
      </Helmet>
      <LoginForm client={client} />
    </>
  );
}

RequireAuth.propTypes = {
  children: PropTypes.node.isRequired
};
