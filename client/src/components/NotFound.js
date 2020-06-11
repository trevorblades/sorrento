import React from 'react';
import {Box, Text} from '@chakra-ui/core';

export default function NotFound() {
  return (
    <Box p={[5, 6]}>
      <Box mx="auto" maxW="containers.lg">
        <Text>Not found</Text>
      </Box>
    </Box>
  );
}
