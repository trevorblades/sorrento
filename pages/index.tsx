import NextLink from "next/link";
import React from "react";
import { Link } from "@chakra-ui/react";

export default function HomePage() {
  return (
    <div>
      welcome to sorrento{" "}
      <Link as={NextLink} href="/list">
        to the list
      </Link>
    </div>
  );
}
