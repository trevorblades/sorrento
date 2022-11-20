import React from "react";
import { Button } from "@chakra-ui/react";
import { Customer, useRemoveCustomerMutation } from "../generated/graphql";

type RemoveCustomerProps = {
  customer: Pick<Customer, "id">;
};

export function RemoveCustomer({ customer }: RemoveCustomerProps) {
  const [removeCustomer, { loading }] = useRemoveCustomerMutation({
    variables: {
      id: customer.id,
    },
  });
  return (
    <Button onClick={() => removeCustomer()} isLoading={loading}>
      Remove
    </Button>
  );
}
