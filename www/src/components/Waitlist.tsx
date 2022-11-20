import React, { useCallback } from "react";
import {
  AcceptingChangedDocument,
  AcceptingChangedSubscription,
  useListCustomersQuery,
} from "../generated/graphql";
import { AcceptingSwitch } from "./AcceptingSwitch";
import { List, ListItem } from "@chakra-ui/react";

export function Waitlist() {
  const { data, loading, error, subscribeToMore } = useListCustomersQuery();

  const onAcceptingSwitchMount = useCallback(() => {
    subscribeToMore<AcceptingChangedSubscription>({
      document: AcceptingChangedDocument,
      updateQuery: (prev, { subscriptionData }) => ({
        ...prev,
        isAccepting: subscriptionData.data.acceptingChanged,
      }),
    });
  }, [subscribeToMore]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  if (!data?.customers.length) {
    return <div>No customers</div>;
  }

  return (
    <>
      <AcceptingSwitch
        isAccepting={data.isAccepting}
        onMount={onAcceptingSwitchMount}
      />
      <List>
        {data.customers.map((customer) => (
          <ListItem key={customer.id}>
            {customer.name} {customer.phone}
          </ListItem>
        ))}
      </List>
    </>
  );
}
