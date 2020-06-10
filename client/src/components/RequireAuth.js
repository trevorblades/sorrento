import LoginForm from './LoginForm';
import PropTypes from 'prop-types';
import React from 'react';
import {GET_LOGGED_IN} from '../utils';
import {Helmet} from 'react-helmet';
import {useQuery} from '@apollo/client';

export default function RequireAuth(props) {
  const {data, client} = useQuery(GET_LOGGED_IN);

  if (data?.isLoggedIn) {
    return props.children;
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
