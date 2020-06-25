import PropTypes from 'prop-types';
import React from 'react';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import {Switch} from '@chakra-ui/core';
import {gql, useMutation} from '@apollo/client';

const ON_ORGANIZATION_UPDATED = gql`
  subscription OnOrganizationUpdated {
    organizationUpdated {
      id
      accepting
    }
  }
`;

const UPDATE_ORGANIZATION = gql`
  mutation UpdateOrganization($input: UpdateOrganizationInput!) {
    updateOrganization(input: $input) {
      id
      accepting
    }
  }
`;

export default function AcceptingSwitch({organization, subscribeToMore}) {
  const [updateOrganization] = useMutation(UPDATE_ORGANIZATION);
  useEffectOnce(() => subscribeToMore({document: ON_ORGANIZATION_UPDATED}));

  function handleChange(event) {
    const {checked: accepting} = event.target;
    if (
      accepting ||
      confirm('Are you sure you want to stop accepting customers?')
    ) {
      updateOrganization({
        variables: {
          input: {
            id: organization.id,
            accepting
          }
        }
      });
    }
  }

  return (
    <Switch
      color="green"
      display="flex"
      onChange={handleChange}
      isChecked={organization.accepting}
    />
  );
}

AcceptingSwitch.propTypes = {
  organization: PropTypes.object.isRequired,
  subscribeToMore: PropTypes.func.isRequired
};
