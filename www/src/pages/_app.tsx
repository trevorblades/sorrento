import React from "react";
import { ApolloProvider } from "@apollo/client";
import { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { client } from "../utils/client";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <ChakraProvider>
        <Component {...pageProps} />
      </ChakraProvider>
    </ApolloProvider>
  );
}
