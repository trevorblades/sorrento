import React from "react";
import { Switch } from "@chakra-ui/react";
import { useSetAcceptingMutation } from "../generated/graphql";

type AcceptingSwitchProps = {
  isAccepting: boolean;
};

export function AcceptingSwitch({ isAccepting }: AcceptingSwitchProps) {
  const [setAccepting, { loading }] = useSetAcceptingMutation();
  return (
    <Switch
      isChecked={isAccepting}
      onChange={(event) => {
        if (!loading) {
          setAccepting({
            variables: {
              accepting: event.target.checked,
            },
          });
        }
      }}
    />
  );
}
