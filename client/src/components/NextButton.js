import PropTypes from 'prop-types';
import React from 'react';
import {Box, Button} from '@chakra-ui/core';
import {SERVE_CUSTOMER} from '../utils';
import {useMutation} from '@apollo/client';

export default function NextButton({mutationOptions, ...props}) {
  const [nextCustomer, {loading}] = useMutation(
    SERVE_CUSTOMER,
    mutationOptions
  );

  return (
    <Button isLoading={loading} onClick={nextCustomer} {...props}>
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
