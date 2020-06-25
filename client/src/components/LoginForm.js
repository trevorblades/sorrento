import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {Box, Button, Flex, Heading, Input, Stack, Text} from '@chakra-ui/core';

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
      localStorage.setItem('sorrento:token', token);
      props.client.resetStore();
    } else {
      setError(response.statusText);
      setLoading(false);
    }
  }

  return (
    <Flex minH="100vh">
      <Box
        as="form"
        onSubmit={handleSubmit}
        autoComplete="off"
        m="auto"
        w="full"
        p="10"
        maxW={{md: 400}}
      >
        <Heading mb="8" textAlign="center" fontSize="4xl">
          🎱 W8UP
        </Heading>
        <Stack spacing="4">
          {error && <Text color="red.500">{error}</Text>}
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
        </Stack>
        <Box textAlign="right" mt="6">
          <Button
            variantColor="green"
            isLoading={loading}
            size="lg"
            ml="auto"
            type="submit"
          >
            Log in
          </Button>
        </Box>
      </Box>
    </Flex>
  );
}

LoginForm.propTypes = {
  client: PropTypes.object.isRequired
};
