import PropTypes from 'prop-types';
import React from 'react';
import {Button} from '@chakra-ui/core';
import {SERVE_CUSTOMER} from '../utils';
import {useMutation} from '@apollo/client';

export default function ServeButton(props) {
  const [serveCustomer, {loading}] = useMutation(SERVE_CUSTOMER, {
    variables: {
      id: props.customer.id
    }
  });

  return (
    <Button
      size="sm"
      variantColor="blue"
      isLoading={loading}
      mr="3"
      onClick={serveCustomer}
    >
      Serve
    </Button>
  );
}

ServeButton.propTypes = {
  customer: PropTypes.object.isRequired
};
