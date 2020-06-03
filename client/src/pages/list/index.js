import App from '../../components/app';
import LoginForm from '../../components/login-form';
import NoSsr from '@mpth/react-no-ssr';
import PropTypes from 'prop-types';
import React from 'react';
import decode from 'jwt-decode';
import icon from '../../assets/icon.svg';
import logo from '../../assets/logo.svg';
import useLocalStorage from 'react-use/lib/useLocalStorage';
import {Box, Flex, IconButton, Stack, Tooltip} from '@chakra-ui/core';
import {FaHistory, FaListOl, FaSignOutAlt} from 'react-icons/fa';
import {Helmet} from 'react-helmet';
import {LOGO_HEIGHT, LOGO_MARGIN} from '../../utils';

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

export default function List() {
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
    <>
      <Helmet defaultTitle="Sorrento" titleTemplate="%s - Sorrento" />
      <NoSsr>
        {user ? (
          <Flex>
            <Helmet>
              <title>Logged in as {user.name}</title>
            </Helmet>
            <Box
              as="aside"
              w={{
                base: '64px',
                lg: '72px'
              }}
              h="100vh"
              textAlign="center"
              bg="red.500"
              position="sticky"
              top="0"
              zIndex="sticky"
            >
              <Box
                as="img"
                src={logo}
                h={LOGO_HEIGHT}
                maxW="none"
                m={LOGO_MARGIN}
                display={{
                  base: 'none',
                  lg: 'block'
                }}
              />
              <Box
                as="img"
                src={icon}
                h={LOGO_HEIGHT}
                my={LOGO_MARGIN}
                mx="auto"
                display={{lg: 'none'}}
              />
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
          <>
            <Helmet>
              <title>Log in</title>
            </Helmet>
            <LoginForm setToken={setToken} />
          </>
        )}
      </NoSsr>
    </>
  );
}
