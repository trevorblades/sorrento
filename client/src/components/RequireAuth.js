import LoginForm from './LoginForm';
import PropTypes from 'prop-types';
import React from 'react';
import {Helmet} from 'react-helmet';
import {UserContext} from '../utils';
import {gql, useQuery} from '@apollo/client';

const GET_USER = gql`
  query GetUser {
    user @client
  }
`;

export default function RequireAuth(props) {
  const {data, client} = useQuery(GET_USER);

  if (data?.user) {
    return (
      <UserContext.Provider
        value={{
          user: data.user,
          logOut() {
            localStorage.removeItem('sorrento:token');
            client.writeQuery({
              query: GET_USER,
              data: {
                user: null
              }
            });
          }
        }}
      >
        {props.children}
      </UserContext.Provider>
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
