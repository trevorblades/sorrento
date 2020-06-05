import React from 'react';
import {ORGANIZATION_FRAGMENT} from '../utils';
import {Switch} from '@chakra-ui/core';
import {gql, useMutation} from '@apollo/client';

const UPDATE_ORGANIZATION = gql`
  mutation UpdateOrganization($input: UpdateOrganizationInput!) {
    updateOrganization(input: $input) {
      ...OrganizationFragment
    }
  }
  ${ORGANIZATION_FRAGMENT}
`;

export default function AcceptingSwitch(props) {
  const [updateOrganization, {loading}] = useMutation(UPDATE_ORGANIZATION);

  function handleChange(event) {
    const {checked: accepting} = event.target;
    if (
      accepting ||
      confirm('Are you sure you want to stop accepting customers?')
    ) {
      updateOrganization({
        variables: {
          input: {
            accepting
          }
        }
      });
    }
  }

  return (
    <Switch
      display="flex"
      isDisabled={loading}
      onChange={handleChange}
      {...props}
    />
  );
}
