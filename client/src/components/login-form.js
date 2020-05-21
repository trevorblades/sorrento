import PropTypes from 'prop-types';
import React, {useState} from 'react';
import logo from '../assets/logo.svg';
import {Box, Button, Flex, Input, Stack, Text} from '@chakra-ui/core';

export default function LoginForm(props) {
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
      props.setToken(token);
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
      <Box as="img" src={logo} h="20" mb="20" />
      <Stack spacing="4" w="full" maxW={{md: 480}}>
        {error && (
          <Text textAlign="center" fontWeight="bold">
            {error}
          </Text>
        )}
        <Input size="lg" isRequired placeholder="Username" name="username" />
        <Input
          size="lg"
          isRequired
          placeholder="Password"
          type="password"
          name="password"
        />
        <Button
          bg="gray.900"
          _hover={{bg: 'gray.800'}}
          _active={{bg: 'gray.700'}}
          color="white"
          isLoading={loading}
          size="lg"
          mt="2"
          ml="auto"
          type="submit"
        >
          Submit
        </Button>
      </Stack>
    </Flex>
  );
}

LoginForm.propTypes = {
  setToken: PropTypes.func.isRequired
};
