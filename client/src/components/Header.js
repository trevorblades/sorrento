import PropTypes from 'prop-types';
import React from 'react';
import {Flex, Heading, Link} from '@chakra-ui/core';
import {Link as GatsbyLink} from 'gatsby';

export default function Header(props) {
  return (
    <Flex
      h="56px"
      align="center"
      as="header"
      position="sticky"
      top="0"
      zIndex="sticky"
      bg="gray.900"
      px="6"
    >
      <Heading mr="auto" as="h1" fontSize="2xl" color="white">
        <Link _hover={{textDecor: 'none'}} as={GatsbyLink} to="/">
          W8UP
        </Link>
      </Heading>
      {props.children}
    </Flex>
  );
}

Header.propTypes = {
  children: PropTypes.node.isRequired
};
