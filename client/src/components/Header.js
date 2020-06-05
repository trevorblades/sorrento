import NavLink from './NavLink';
import OrganizationStatus from './OrganizationStatus';
import PropTypes from 'prop-types';
import React, {useContext} from 'react';
import {
  Avatar,
  Box,
  Button,
  DarkMode,
  Flex,
  Heading,
  IconButton,
  LightMode,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList,
  Skeleton,
  Stack,
  Text
} from '@chakra-ui/core';
import {FaEllipsisH} from 'react-icons/fa';
import {Link as GatsbyLink} from 'gatsby';
import {LocationContext, ORGANIZATION_FRAGMENT, UserContext} from '../utils';
import {gql, useQuery} from '@apollo/client';

const GET_ORGANIZATION = gql`
  query GetOrganization {
    organization {
      ...OrganizationFragment
    }
  }
  ${ORGANIZATION_FRAGMENT}
`;

export default function Header(props) {
  const {user, logOut} = useContext(UserContext);
  const {data, loading, error, subscribeToMore} = useQuery(GET_ORGANIZATION);
  return (
    <DarkMode>
      <Flex
        as="header"
        px="2"
        h="12"
        align="center"
        position="sticky"
        top="0"
        zIndex="sticky"
        bg="gray.900"
        color="white"
      >
        <Heading
          ml="2"
          mr={{
            base: 2,
            md: 6
          }}
          as="h1"
          fontSize="2xl"
        >
          W8UP
        </Heading>
        <LocationContext.Provider value={props.location}>
          <Stack
            display={{
              base: 'none',
              md: 'flex'
            }}
            isInline
            spacing="4"
            mr="auto"
          >
            <NavLink to="/app">Waitlist</NavLink>
            <NavLink to="/app/customers">Customer history</NavLink>
          </Stack>
          <Box display={{md: 'none'}} mr="auto">
            <Menu>
              <MenuButton
                as={IconButton}
                icon={FaEllipsisH}
                size="sm"
                rounded="full"
                variant="ghost"
              />
              <LightMode>
                <MenuList color="gray.800">
                  <MenuItem as={GatsbyLink} to="/app">
                    Waitlist
                  </MenuItem>
                  <MenuItem as={GatsbyLink} to="/app/customers">
                    Customer history
                  </MenuItem>
                </MenuList>
              </LightMode>
            </Menu>
          </Box>
        </LocationContext.Provider>
        {loading ? (
          <Skeleton rounded="md" w="120px" h="8" />
        ) : error ? (
          <Text color="red.500">{error.message}</Text>
        ) : (
          <OrganizationStatus
            subscribeToMore={subscribeToMore}
            organization={data.organization}
          />
        )}
        <Menu>
          <MenuButton as={Button} size="sm" px="2" ml="2" variant="ghost">
            <Box as="span" mr="2" display={['none', 'initial']}>
              {user.name}
            </Box>
            <Avatar fontSize="sm" size="xs" name={user.name} />
          </MenuButton>
          <LightMode>
            <MenuList color="gray.800" placement="auto-end">
              <MenuGroup title={`Logged in as ${user.name}`}>
                <MenuItem>Account settings</MenuItem>
                <MenuItem onClick={logOut}>Log out</MenuItem>
              </MenuGroup>
            </MenuList>
          </LightMode>
        </Menu>
      </Flex>
    </DarkMode>
  );
}

Header.propTypes = {
  location: PropTypes.object.isRequired
};
