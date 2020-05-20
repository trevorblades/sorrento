import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {Button, Flex, Input, Stack, Text} from '@chakra-ui/core';

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
      w={2 / 3}
      h="100vh"
      px="16"
      bg="red.500"
      autoComplete="off"
      onSubmit={handleSubmit}
    >
      <Stack spacing="4" w="full" maxW="480px">
        {error && <Text>{error}</Text>}
        <Input size="lg" isRequired placeholder="Username" name="username" />
        <Input
          size="lg"
          isRequired
          placeholder="Password"
          type="password"
          name="password"
        />
        <Button isLoading={loading} size="lg" mt="2" ml="auto" type="submit">
          Submit
        </Button>
      </Stack>
    </Flex>
  );
}

LoginForm.propTypes = {
  setToken: PropTypes.func.isRequired
};
