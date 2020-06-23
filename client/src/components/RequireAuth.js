import LoginForm from './LoginForm';
import PropTypes from 'prop-types';
import React from 'react';
import {Flex} from '@chakra-ui/core';
import {Helmet} from 'react-helmet';
import {LogOutContext} from '../utils';
import {gql, useQuery} from '@apollo/client';

const GET_LOGGED_IN = gql`
  query GetLoggedIn {
    isLoggedIn @client
  }
`;

export default function RequireAuth(props) {
  const {data, client} = useQuery(GET_LOGGED_IN);

  if (data?.isLoggedIn) {
    return (
      <LogOutContext.Provider
        value={() => {
          localStorage.removeItem('sorrento:token');
          client.writeQuery({
            query: GET_LOGGED_IN,
            data: {
              isLoggedIn: false
            }
          });
        }}
      >
        <Flex minH="100vh" direction="column">
          {props.children}
        </Flex>
      </LogOutContext.Provider>
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
