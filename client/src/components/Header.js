import NavLink from './NavLink';
import OrganizationStatus from './OrganizationStatus';
import React, {useContext} from 'react';
import {
  Avatar,
  Box,
  Button,
  DarkMode,
  Flex,
  Heading,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
  Skeleton,
  Stack,
  Text
} from '@chakra-ui/core';
import {FaEllipsisH} from 'react-icons/fa';
import {Link as GatsbyLink} from 'gatsby';
import {ORGANIZATION_FRAGMENT, UserContext} from '../utils';
import {gql, useQuery} from '@apollo/client';

const GET_ORGANIZATION = gql`
  query GetOrganization {
    organization {
      ...OrganizationFragment
    }
  }
  ${ORGANIZATION_FRAGMENT}
`;

export default function Header() {
  const {user, logOut} = useContext(UserContext);
  const {data, loading, error, subscribeToMore} = useQuery(GET_ORGANIZATION);
  return (
    <Box
      as="header"
      position="sticky"
      top="0"
      zIndex="sticky"
      bg="gray.900"
      px="4"
      color="white"
    >
      <Flex mx="auto" h="12" align="center" maxW="containers.lg">
        <Heading
          mr={{
            base: 2,
            md: 6
          }}
          as="h1"
          fontSize="2xl"
        >
          <Link _hover={{textDecor: 'none'}} as={GatsbyLink} to="/">
            W8UP
          </Link>
        </Heading>
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
            <DarkMode>
              <MenuButton
                as={IconButton}
                icon={FaEllipsisH}
                size="sm"
                rounded="full"
                variant="ghost"
              />
            </DarkMode>
            <MenuList color="gray.800">
              <MenuItem as={GatsbyLink} to="/app">
                Waitlist
              </MenuItem>
              <MenuItem as={GatsbyLink} to="/app/customers">
                Customer history
              </MenuItem>
            </MenuList>
          </Menu>
        </Box>
        {loading ? (
          <Skeleton w="34px" h="5" rounded="full" />
        ) : error ? (
          <Text color="red.500">{error.message}</Text>
        ) : (
          <DarkMode>
            <OrganizationStatus
              subscribeToMore={subscribeToMore}
              organization={data.organization}
            />
          </DarkMode>
        )}
        <Menu>
          <DarkMode>
            <MenuButton
              as={Button}
              size="sm"
              px="2"
              ml="2"
              mr="-8px"
              variant="ghost"
            >
              <Box as="span" mr="2" display={['none', 'initial']}>
                {user.name}
              </Box>
              <Avatar fontSize="sm" size="xs" name={user.name} />
            </MenuButton>
          </DarkMode>
          <MenuList color="gray.800" placement="auto-end">
            {data && (
              <>
                <MenuItem>{data.organization.name}</MenuItem>
                <MenuDivider />
              </>
            )}
            <MenuGroup title={`Logged in as ${user.name}`}>
              <MenuItem>Account settings</MenuItem>
              <MenuItem onClick={logOut}>Log out</MenuItem>
            </MenuGroup>
          </MenuList>
        </Menu>
      </Flex>
    </Box>
  );
}
