import React, { PropsWithChildren } from "react";
import { LoginForm } from "./LoginForm";
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
      <div>
        <LoginForm />
      </div>
    );
  }

  return <>{children}</>;
}
