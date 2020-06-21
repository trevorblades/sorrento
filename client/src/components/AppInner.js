import CreateOrganization from './CreateOrganization';
import Header from './Header';
import OrganizationStatus from './OrganizationStatus';
import PropTypes from 'prop-types';
import QueryLoader from './QueryLoader';
import React from 'react';
import {
  Avatar,
  Box,
  Button,
  DarkMode,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList
} from '@chakra-ui/core';
import {Elements} from '@stripe/react-stripe-js';
import {GET_LOGGED_IN} from '../utils';
import {Link as GatsbyLink} from 'gatsby';
import {gql} from '@apollo/client';
import {loadStripe} from '@stripe/stripe-js';

const LIST_PHONE_NUMBERS = gql`
  query ListPhoneNumbers {
    phoneNumbers {
      friendlyName
      phoneNumber
    }
  }
`;

const stripePromise = loadStripe(process.env.GATSBY_STRIPE_PUBLISHABLE_KEY);

export default function AppInner({children, client, subscribeToMore, data}) {
  function logOut() {
    localStorage.removeItem('sorrento:token');
    client.writeQuery({
      query: GET_LOGGED_IN,
      data: {
        isLoggedIn: false
      }
    });
  }

  if (!data.organization) {
    return (
      <Elements stripe={stripePromise}>
        <QueryLoader query={LIST_PHONE_NUMBERS} component={CreateOrganization}>
          <Button onClick={logOut}>Log out</Button>
        </QueryLoader>
      </Elements>
    );
  }

  return (
    <>
      <Header>
        <DarkMode>
          <OrganizationStatus
            subscribeToMore={subscribeToMore}
            organization={data.organization}
          />
        </DarkMode>
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
                {data.me.name}
              </Box>
              <Avatar fontSize="sm" size="xs" name={data.me.name} />
            </MenuButton>
          </DarkMode>
          <MenuList color="gray.800" placement="auto-end">
            <MenuItem as={GatsbyLink} to="/app/organization">
              {data.organization.name}
            </MenuItem>
            <MenuGroup title={`Logged in as ${data.me.name}`}>
              <MenuItem>Account settings</MenuItem>
              <MenuItem onClick={logOut}>Log out</MenuItem>
            </MenuGroup>
          </MenuList>
        </Menu>
      </Header>
      {children}
    </>
  );
}

AppInner.propTypes = {
  client: PropTypes.object.isRequired,
  subscribeToMore: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired
};
