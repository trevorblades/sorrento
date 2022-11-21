import React from "react";
import { Button } from "@chakra-ui/react";
import { Customer, useRemoveCustomerMutation } from "../generated/graphql";

type RemoveCustomerProps = {
  customer: Pick<Customer, "id" | "name">;
};

export function RemoveCustomer({ customer }: RemoveCustomerProps) {
  const [removeCustomer, { loading }] = useRemoveCustomerMutation({
    variables: {
      id: customer.id,
    },
  });

  return (
    <Button
      size="sm"
      variant="ghost"
      borderRadius="full"
      isLoading={loading}
      onClick={() => {
        if (confirm(`Are you sure you want to remove "${customer.name}"?`)) {
          removeCustomer();
        }
      }}
    >
      Remove
    </Button>
  );
}
