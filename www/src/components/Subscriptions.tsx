import React, { useEffect } from "react";

type SubscriptionsProps = {
  subscribeToCustomerAdded: () => () => void;
};

export function Subscriptions({
  subscribeToCustomerAdded,
}: SubscriptionsProps) {
  useEffect(subscribeToCustomerAdded, [subscribeToCustomerAdded]);
  return null;
}
