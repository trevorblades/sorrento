import PropTypes from 'prop-types';
import React from 'react';
import {Box, Button, Flex, Input} from '@chakra-ui/core';

export default function LoginForm(props) {
  async function handleSubmit(event) {
    event.preventDefault();

    const {username, password} = event.target;
    const basicAuth = `${username.value}:${password.value}`;
    const response = await fetch(`${process.env.GATSBY_API_URL}/auth`, {
      headers: {
        Authorization: `Basic ${btoa(basicAuth)}`
      }
    });

    if (response.ok) {
      const token = await response.text();
      props.setToken(token);
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
      <Box textAlign="right" w="full" maxW="480px">
        <Input
          size="lg"
          isRequired
          mb="4"
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
        <Button size="lg" mt="6" type="submit">
          Submit
        </Button>
      </Box>
    </Flex>
  );
}

LoginForm.propTypes = {
  setToken: PropTypes.func.isRequired
};
