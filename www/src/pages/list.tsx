import React from "react";
import dynamic from "next/dynamic";
import { Button } from "@chakra-ui/react";
import { NextSeo } from "next-seo";
import { Waitlist } from "../components/Waitlist";
import { useApolloClient } from "@apollo/client";

const AuthCheck = dynamic(() => import("../components/AuthCheck"), {
  ssr: false,
});

export default function ListPage() {
  const client = useApolloClient();
  return (
    <AuthCheck>
      <NextSeo title="Waitlist" />
      <Waitlist />
      <Button
        onClick={() => {
          localStorage.removeItem("token");
          client.resetStore();
        }}
      >
        Log out
      </Button>
    </AuthCheck>
  );
}
