import PropTypes from 'prop-types';
import React from 'react';
import {Box, Button} from '@chakra-ui/core';
import {FaArrowRight} from 'react-icons/fa';
import {SERVE_CUSTOMER} from '../utils';
import {useMutation} from '@apollo/client';

export default function NextButton({mutationOptions, ...props}) {
  const [nextCustomer, {loading}] = useMutation(
    SERVE_CUSTOMER,
    mutationOptions
  );

  return (
    <Button
      mt="auto"
      w="full"
      rounded="none"
      h="20"
      variantColor="green"
      fontSize="3xl"
      position="sticky"
      bottom="0"
      textTransform="uppercase"
      rightIcon={FaArrowRight}
      isLoading={loading}
      onClick={nextCustomer}
      {...props}
    >
      <span>
        Next{' '}
        <Box
          as="span"
          display={{
            display: 'none',
            md: 'inline'
          }}
        >
          customer
        </Box>
      </span>
    </Button>
  );
}

NextButton.propTypes = {
  mutationOptions: PropTypes.object.isRequired
};
