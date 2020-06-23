import PropTypes from 'prop-types';
import React, {useContext} from 'react';
import {Button} from '@chakra-ui/core';
import {LogOutContext} from '../utils';

export default function UserMenu(props) {
  const logOut = useContext(LogOutContext);
  return (
    <>
      {props.user.name}
      <Button size="sm" onClick={logOut}>
        Log out
      </Button>
    </>
  );
}

UserMenu.propTypes = {
  user: PropTypes.object.isRequired
};
