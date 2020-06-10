import Header from '../components/Header';
import History from '../components/History';
import Layout from '../components/Layout';
import ListCustomers from '../components/ListCustomers';
import NoSsr from '@mpth/react-no-ssr';
import OrganizationStatus from '../components/OrganizationStatus';
import PropTypes from 'prop-types';
import React from 'react';
import RequireAuth from '../components/RequireAuth';
import Waitlist from '../components/Waitlist';
import {
  Avatar,
  Box,
  Button,
  DarkMode,
  Flex,
  Heading,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList,
  Radio,
  RadioGroup,
  Spinner,
  Text
} from '@chakra-ui/core';
import {GET_LOGGED_IN, ORGANIZATION_FRAGMENT} from '../utils';
import {Router} from '@reach/router';
import {gql, useQuery} from '@apollo/client';

function NotFound() {
  return (
    <Box>
      <Box mx="auto" w="full" maxW="containers.lg">
        <Text>Not found</Text>
      </Box>
    </Box>
  );
}

const LIST_PHONE_NUMBERS = gql`
  query ListPhoneNumbers {
    phoneNumbers {
      friendlyName
      phoneNumber
    }
  }
`;

function PhoneNumbers(props) {
  const {data, loading, error} = useQuery(LIST_PHONE_NUMBERS);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <Text color="red.500">{error.message}</Text>;
  }

  return (
    <>
      <Heading fontSize="3xl">Create an organization</Heading>
      <RadioGroup defaultValue={data.phoneNumbers[0].phoneNumber}>
        {data.phoneNumbers.map(phoneNumber => (
          <Radio key={phoneNumber.phoneNumber} value={phoneNumber.phoneNumber}>
            {phoneNumber.friendlyName}
          </Radio>
        ))}
      </RadioGroup>
      <Text>Payment option: TODO</Text>
      <Button>Create organization</Button>
      {props.children}
    </>
  );
}

PhoneNumbers.propTypes = {
  children: PropTypes.node.isRequired
};

const GET_ORGANIZATION = gql`
  query GetOrganization {
    me {
      name
      organization {
        ...OrganizationFragment
      }
    }
  }
  ${ORGANIZATION_FRAGMENT}
`;

function AppInner(props) {
  const {data, loading, error, subscribeToMore, client} = useQuery(
    GET_ORGANIZATION
  );

  if (loading) {
    return (
      <Box m="auto">
        <Spinner />
      </Box>
    );
  }

  if (error) {
    return <Text color="red.500">{error.message}</Text>;
  }

  function logOut() {
    localStorage.removeItem('sorrento:token');
    client.writeQuery({
      query: GET_LOGGED_IN,
      data: {
        isLoggedIn: false
      }
    });
  }

  if (!data.me.organization) {
    return (
      <Box m="auto">
        <PhoneNumbers>
          <Button onClick={logOut}>Log out</Button>
        </PhoneNumbers>
      </Box>
    );
  }

  return (
    <>
      <Header>
        <DarkMode>
          <OrganizationStatus
            subscribeToMore={subscribeToMore}
            organization={data.me.organization}
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
            <MenuItem>{data.me.organization.name}</MenuItem>
            <MenuGroup title={`Logged in as ${data.me.name}`}>
              <MenuItem>Account settings</MenuItem>
              <MenuItem onClick={logOut}>Log out</MenuItem>
            </MenuGroup>
          </MenuList>
        </Menu>
      </Header>
      {props.children}
    </>
  );
}

AppInner.propTypes = {
  children: PropTypes.node.isRequired
};

export default function App(props) {
  return (
    <Layout>
      <NoSsr>
        <RequireAuth>
          <Flex direction="column" minH="100vh">
            <AppInner>
              <Flex
                flexGrow="1"
                direction="column"
                as={Router}
                location={props.location}
              >
                <ListCustomers
                  path="/app"
                  served={false}
                  component={Waitlist}
                />
                <ListCustomers
                  path="/app/customers"
                  served
                  component={History}
                />
                <NotFound default />
              </Flex>
            </AppInner>
          </Flex>
        </RequireAuth>
      </NoSsr>
    </Layout>
  );
}

App.propTypes = {
  location: PropTypes.object.isRequired
};
