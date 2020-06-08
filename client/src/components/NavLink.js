import PropTypes from 'prop-types';
import React from 'react';
import {Link as GatsbyLink} from 'gatsby';
import {Link} from '@chakra-ui/core';
import {Location} from '@reach/router';

export default function NavLink(props) {
  return (
    <Location>
      {({location}) => (
        <Link
          as={GatsbyLink}
          color={
            props.to === location.pathname.replace(/\/$/, '')
              ? undefined
              : 'gray.500'
          }
          {...props}
        />
      )}
    </Location>
  );
}

NavLink.propTypes = {
  to: PropTypes.string.isRequired
};
