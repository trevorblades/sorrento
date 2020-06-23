import NavLink from './NavLink';
import React, {useContext} from 'react';
import {
  Box,
  Button,
  DarkMode,
  Flex,
  Heading,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack
} from '@chakra-ui/core';
import {FaEllipsisH} from 'react-icons/fa';
import {Link as GatsbyLink} from 'gatsby';
import {UserContext} from '../utils';

export default function Header() {
  const {user, logOut} = useContext(UserContext);
  return (
    <Flex
      h="12"
      align="center"
      as="header"
      position="sticky"
      top="0"
      zIndex="sticky"
      bg="gray.900"
      px="4"
      color="white"
    >
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
      <div>{user.name}</div>
      <Button onClick={logOut} size="sm">
        Log out
      </Button>
    </Flex>
  );
}
