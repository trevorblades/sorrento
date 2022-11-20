import React, { useCallback } from "react";
import {
  AcceptingChangedDocument,
  AcceptingChangedSubscription,
  CustomerRemovedDocument,
  CustomerRemovedSubscription,
  useListCustomersQuery,
} from "../generated/graphql";
import { AcceptingSwitch } from "./AcceptingSwitch";
import { List, ListItem } from "@chakra-ui/react";
import { RemoveCustomer } from "./RemoveCustomer";

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

    subscribeToMore<CustomerRemovedSubscription>({
      document: CustomerRemovedDocument,
      updateQuery: (prev, { subscriptionData }) => ({
        ...prev,
        customers: prev.customers.filter(
          (customer) => customer.id !== subscriptionData.data.customerRemoved.id
        ),
      }),
    });
  }, [subscribeToMore]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  if (!data) {
    throw new Error("No data");
  }

  return (
    <>
      <AcceptingSwitch
        isAccepting={data.isAccepting}
        onMount={onAcceptingSwitchMount}
      />
      {data.customers.length ? (
        <List>
          {data.customers.map((customer) => (
            <ListItem key={customer.id}>
              {customer.name} {customer.phone}
              <RemoveCustomer customer={customer} />
            </ListItem>
          ))}
        </List>
      ) : (
        <div>No customers</div>
      )}
    </>
  );
}
