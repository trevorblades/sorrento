import React, { PropsWithChildren } from "react";
import { Box, Center } from "@chakra-ui/react";
import { LoginForm } from "./LoginForm";
import { NextSeo } from "next-seo";
import { useGetUserQuery } from "../generated/graphql";

export default function AuthCheck({ children }: PropsWithChildren) {
  const { data, loading, error } = useGetUserQuery();

  if (loading) {
    return <div>Loading...</div>;
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

  return <>{children}</>;
}
