import App from '../components/app';
import LoginForm from '../components/login-form';
import NoSsr from '@mpth/react-no-ssr';
import PropTypes from 'prop-types';
import React from 'react';
import decode from 'jwt-decode';
import logo from '../assets/logo.svg';
import useLocalStorage from 'react-use/lib/useLocalStorage';
import {Box, Flex, IconButton, Stack, Tooltip} from '@chakra-ui/core';
import {FaHistory, FaListOl, FaSignOutAlt} from 'react-icons/fa';

function SidebarButton({label, isSelected, ...props}) {
  return (
    <Tooltip label={label}>
      <IconButton
        variant="ghost"
        _hover={{bg: 'red.400'}}
        _active={{bg: 'red.300'}}
        fontSize="2xl"
        color={isSelected ? 'white' : 'red.700'}
        rounded="full"
        {...props}
      />
    </Tooltip>
  );
}

SidebarButton.propTypes = {
  label: PropTypes.string.isRequired,
  isSelected: PropTypes.bool
};

export default function Index() {
  const [user, setToken, removeToken] = useLocalStorage(
    'sorrento:token',
    undefined,
    {
      deserializer(value) {
        try {
          const token = JSON.parse(value);
          const user = decode(token);
          return {
            ...user,
            token
          };
        } catch (error) {
          return null;
        }
      }
    }
  );

  return (
    <NoSsr>
      {user ? (
        <Flex h="100vh">
          <Box as="aside" w="72px" textAlign="center" bg="red.500">
            <Box as="img" src={logo} h="12" maxW="none" m="4" />
            <Stack mt="8" align="center" spacing="4">
              <SidebarButton icon={FaListOl} label="Waitlist" isSelected />
              <SidebarButton icon={FaHistory} label="Customer history" />
              <SidebarButton
                icon={FaSignOutAlt}
                onClick={removeToken}
                label="Log out"
              />
            </Stack>
          </Box>
          <App user={user} />
        </Flex>
      ) : (
        <LoginForm setToken={setToken} />
      )}
    </NoSsr>
  );
}
