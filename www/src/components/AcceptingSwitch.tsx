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
  const [setAccepting] = useSetAcceptingMutation();

  useEffect(onMount, [onMount]);

  return (
    <Switch
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
