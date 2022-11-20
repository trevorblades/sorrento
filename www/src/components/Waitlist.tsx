import React from "react";
import { List, ListItem } from "@chakra-ui/react";
import { useListCustomersQuery } from "../generated/graphql";

export function Waitlist() {
  const { data, loading, error } = useListCustomersQuery();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  if (!data?.customers?.length) {
    return <div>No customers</div>;
  }

  return (
    <List>
      {data.customers.map((customer) => (
        <ListItem key={customer.id}>
          {customer.name} {customer.phone}
        </ListItem>
      ))}
    </List>
  );
}
