import React from "react";
import dynamic from "next/dynamic";
import { NextSeo } from "next-seo";
import { Waitlist } from "../components/Waitlist";

const AuthCheck = dynamic(() => import("../components/AuthCheck"), {
  ssr: false,
});

export default function ListPage() {
  return (
    <AuthCheck>
      {(user) => (
        <>
          <NextSeo title="Waitlist" />
          <Waitlist user={user} />
        </>
      )}
    </AuthCheck>
  );
}
