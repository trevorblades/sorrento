import React from 'react';
import {Button} from '@chakra-ui/core';
export const LOGO_HEIGHT = 12;
export const LOGO_MARGIN = 4;

export const DarkButton = props => (
  <Button
    bg="gray.900"
    _hover={{bg: 'gray.800'}}
    _active={{bg: 'gray.700'}}
    color="white"
    {...props}
  />
);
