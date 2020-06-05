import PropTypes from 'prop-types';
import React, {useContext} from 'react';
import {Link as GatsbyLink} from 'gatsby';
import {Link} from '@chakra-ui/core';
import {LocationContext} from '../utils';

export default function NavLink(props) {
  const location = useContext(LocationContext);
  return (
    <Link
      as={GatsbyLink}
      color={props.to === location.pathname ? undefined : 'gray.500'}
      {...props}
    />
  );
}

NavLink.propTypes = {
  to: PropTypes.string.isRequired
};
