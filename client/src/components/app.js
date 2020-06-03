import AppInner from './app-inner';
import PropTypes from 'prop-types';
import React, {useContext} from 'react';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Skeleton,
  Spinner,
  Switch,
  Text
} from '@chakra-ui/core';
import {CUSTOMER_FRAGMENT, ORGANIZATION_FRAGMENT, UserContext} from '../utils';
import {gql, useMutation, useQuery} from '@apollo/client';

function Header(props) {
  const {user, logOut} = useContext(UserContext);
  return (
    <Flex
      as="header"
      px="2"
      h="12"
      align="center"
      position="sticky"
      top="0"
      zIndex="sticky"
      bg="white"
    >
      <Heading ml="2" mr="6" as="h1" fontSize="2xl">
        w8up
      </Heading>
      {props.children}
      <Menu>
        <MenuButton as={Button} ml="auto" size="sm" px="2" variant="ghost">
          {user.name}
          <Avatar ml="2" fontSize="sm" size="xs" name={user.name} />{' '}
        </MenuButton>
        <MenuList placement="auto-end">
          <MenuItem>Account settings</MenuItem>
          <MenuItem onClick={logOut}>Log out</MenuItem>
        </MenuList>
      </Menu>
    </Flex>
  );
}

Header.propTypes = {
  children: PropTypes.node
};

const UPDATE_ORGANIZATION = gql`
  mutation UpdateOrganization($input: UpdateOrganizationInput!) {
    updateOrganization(input: $input) {
      ...OrganizationFragment
    }
  }
  ${ORGANIZATION_FRAGMENT}
`;

function AcceptingSwitch(props) {
  const [updateOrganization, {loading}] = useMutation(UPDATE_ORGANIZATION);

  function handleChange(event) {
    if (
      event.target.checked ||
      confirm('Are you sure you want to stop accepting customers?')
    ) {
      updateOrganization({
        variables: {
          input: {
            accepting: event.target.checked
          }
        }
      });
    }
  }

  return (
    <Switch
      display="flex"
      isDisabled={loading}
      onChange={handleChange}
      {...props}
    />
  );
}

export default function App() {
  const {data, loading, error, subscribeToMore} = useQuery(gql`
    {
      customers {
        ...CustomerFragment
      }
      organization {
        ...OrganizationFragment
      }
    }
    ${CUSTOMER_FRAGMENT}
    ${ORGANIZATION_FRAGMENT}
  `);

  return (
    <>
      <Header>
        {loading ? (
          <Skeleton rounded="md" w="120px" h="8" />
        ) : (
          !error && (
            <>
              <Button mr="2" variant="outline" size="sm">
                {data.organization.name}
              </Button>
              <AcceptingSwitch isChecked={data.organization.accepting} />
              <Text ml="2">
                {data.organization.accepting ? 'Open' : 'Closed'}
              </Text>
            </>
          )
        )}
      </Header>
      {loading ? (
        <Box m="auto">
          <Spinner />
        </Box>
      ) : error ? (
        <Text color="red.500">{error.message}</Text>
      ) : (
        <AppInner data={data} subscribeToMore={subscribeToMore} />
      )}
    </>
  );
}
