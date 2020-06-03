import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {DarkButton, UserContext} from '../utils';
import {Flex, IconButton, Input, Stack, Text, Tooltip} from '@chakra-ui/core';
import {Helmet} from 'react-helmet';
import {gql, useQuery} from '@apollo/client';

function LoginForm(props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const {username, password} = event.target;
    const basicAuth = `${username.value}:${password.value}`;

    setLoading(true);

    const response = await fetch(`${process.env.GATSBY_API_URL}/auth`, {
      headers: {
        Authorization: `Basic ${btoa(basicAuth)}`
      }
    });

    if (response.ok) {
      const token = await response.text();
      localStorage.setItem('sorrento:token', token);
      props.client.resetStore();
    } else {
      setError(response.statusText);
      setLoading(false);
    }
  }

  return (
    <Flex
      as="form"
      direction="column"
      align="center"
      justify="center"
      w={{md: 2 / 3}}
      px={[10, 12, 16]}
      h="100vh"
      bg="red.500"
      autoComplete="off"
      onSubmit={handleSubmit}
    >
      <Stack spacing="4" w="full" maxW={{md: 480}}>
        {error && (
          <Text textAlign="center" fontWeight="bold">
            {error}
          </Text>
        )}
        <Input
          size="lg"
          autoFocus
          isRequired
          placeholder="Username"
          name="username"
        />
        <Input
          size="lg"
          isRequired
          placeholder="Password"
          type="password"
          name="password"
        />
        <DarkButton
          isLoading={loading}
          size="lg"
          mt="2"
          ml="auto"
          type="submit"
        >
          Submit
        </DarkButton>
      </Stack>
    </Flex>
  );
}

LoginForm.propTypes = {
  client: PropTypes.object.isRequired
};

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

const GET_USER = gql`
  {
    user @client
  }
`;

export default function RequireAuth(props) {
  const {data, client} = useQuery(GET_USER);

  if (data?.user) {
    return (
      <UserContext.Provider
        value={{
          user: data.user,
          logOut() {
            localStorage.removeItem('sorrento:token');
            client.writeQuery({
              query: GET_USER,
              data: {
                user: null
              }
            });
          }
        }}
      >
        {props.children}
      </UserContext.Provider>
    );
  }

  return (
    <>
      <Helmet>
        <title>Log in</title>
      </Helmet>
      <LoginForm client={client} />
    </>
  );
}

RequireAuth.propTypes = {
  children: PropTypes.node.isRequired
};
