import React, { useEffect } from "react";
import { Switch } from "@chakra-ui/react";
import { useSetAcceptingMutation } from "../generated/graphql";

type AcceptingSwitchProps = {
  isAccepting: boolean;
  onMount: () => void;
};

export function AcceptingSwitch({
  isAccepting,
  onMount,
}: AcceptingSwitchProps) {
  const [setAccepting, { loading }] = useSetAcceptingMutation({
    update(cache, { data }) {
      cache.modify({
        fields: {
          isAccepting: () => data?.setAccepting,
        },
      });
    },
  });

  useEffect(onMount, []);

  return (
    <Switch
      isDisabled={loading}
      isChecked={isAccepting}
      onChange={(event) =>
        setAccepting({
          variables: {
            accepting: event.target.checked,
          },
        })
      }
    />
  );
}
