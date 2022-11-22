import React, { ReactElement } from "react";
import { Box, Center, Spinner } from "@chakra-ui/react";
import { GetUserQuery, useGetUserQuery } from "../generated/graphql";
import { LoginForm } from "./LoginForm";
import { NextSeo } from "next-seo";

type AuthCheckProps = {
  children: (user: NonNullable<GetUserQuery["me"]>) => ReactElement;
};

export default function AuthCheck({ children }: AuthCheckProps) {
  const { data, loading, error } = useGetUserQuery();

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner />
      </Center>
    );
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  if (!data?.me) {
    return (
      <Center minH="100vh">
        <NextSeo title="Log in" />
        <Box w="full" maxW="md">
          <LoginForm />
        </Box>
      </Center>
    );
  }

  return <>{children(data.me)}</>;
}
