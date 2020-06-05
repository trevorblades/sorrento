import PropTypes from 'prop-types';
import React from 'react';
import {Button} from '@chakra-ui/core';
import {CUSTOMER_FRAGMENT} from '../utils';
import {gql, useMutation} from '@apollo/client';

const REMOVE_CUSTOMER = gql`
  mutation RemoveCustomer($id: ID!) {
    removeCustomer(id: $id) {
      ...CustomerFragment
    }
  }
  ${CUSTOMER_FRAGMENT}
`;

export default function RemoveButton(props) {
  const [removeCustomer, {loading}] = useMutation(REMOVE_CUSTOMER, {
    variables: {
      id: props.customer.id
    }
  });

  return (
    <Button
      size="sm"
      isLoading={loading}
      onClick={() => {
        if (
          confirm(`Are you sure you want to remove "${props.customer.name}"?`)
        ) {
          removeCustomer();
        }
      }}
    >
      Remove
    </Button>
  );
}

RemoveButton.propTypes = {
  customer: PropTypes.object.isRequired
};
