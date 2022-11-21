import React, { ReactNode } from "react";
import {
  Barber,
  Customer,
  useServeCustomerMutation,
} from "../generated/graphql";
import { Button, ButtonProps } from "@chakra-ui/react";

type ServeCustomerProps = {
  children: ReactNode;
  customer?: Pick<Customer, "id"> | null;
  user: Pick<Barber, "id">;
} & ButtonProps;

export function ServeCustomer({
  customer,
  user,
  ...props
}: ServeCustomerProps) {
  const [serveCustomer, { loading }] = useServeCustomerMutation({
    update(cache, { data }) {
      if (data?.serveCustomer) {
        cache.modify({
          id: cache.identify(user),
          fields: {
            nowServing: () => data.serveCustomer,
          },
        });
      }
    },
  });

  return (
    <Button
      {...props}
      isLoading={loading}
      isDisabled={!customer}
      onClick={() => {
        if (customer) {
          serveCustomer({
            variables: {
              id: customer.id,
            },
          });
        }
      }}
    />
  );
}
