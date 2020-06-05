import PropTypes from 'prop-types';
import React from 'react';
import {Button} from '@chakra-ui/core';
import {FaCheckCircle} from 'react-icons/fa';
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
      rounded="full"
      leftIcon={FaCheckCircle}
      size="sm"
      isLoading={loading}
      mr="4"
      onClick={serveCustomer}
    >
      Serve
    </Button>
  );
}

ServeButton.propTypes = {
  customer: PropTypes.object.isRequired
};
