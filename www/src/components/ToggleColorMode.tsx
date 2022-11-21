import React from "react";
import { MenuItem, useColorMode } from "@chakra-ui/react";

export function ToggleColorMode() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <MenuItem onClick={toggleColorMode}>
      {colorMode === "dark" ? "Light" : "Dark"} mode
    </MenuItem>
  );
}
