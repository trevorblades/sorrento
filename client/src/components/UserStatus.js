import PropTypes from 'prop-types';
import React, {useContext} from 'react';
import {Button, Flex, Text} from '@chakra-ui/core';
import {LogOutContext} from '../utils';

export default function UserStatus(props) {
  const logOut = useContext(LogOutContext);
  return (
    <Flex align="center" justify="center">
      <Text>Logged in as {props.user.name}</Text>
      <Button onClick={logOut}>Log out</Button>
    </Flex>
  );
}

UserStatus.propTypes = {
  user: PropTypes.object.isRequired
};
