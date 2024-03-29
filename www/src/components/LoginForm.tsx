import React from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useToast,
} from "@chakra-ui/react";
import { useLogInMutation } from "../generated/graphql";

export function LoginForm() {
  const toast = useToast();
  const [logIn, { loading, client }] = useLogInMutation({
    onError(error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
      });
    },
    onCompleted(data) {
      if (data?.logIn) {
        localStorage.setItem("token", data.logIn);
        client.resetStore();
      }
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();

        const { username, password } = event.target as typeof event.target & {
          username: { value: string };
          password: { value: string };
        };

        logIn({
          variables: {
            username: username.value,
            password: password.value,
          },
        });
      }}
    >
      <Heading mb="6" textAlign="center">
        eSorrento
      </Heading>
      <Stack spacing="4">
        <FormControl isRequired>
          <FormLabel>Username</FormLabel>
          <Input name="username" />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Password</FormLabel>
          <Input type="password" name="password" />
        </FormControl>
        <Button type="submit" isLoading={loading}>
          Log in
        </Button>
      </Stack>
    </form>
  );
}
