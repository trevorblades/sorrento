import AcceptingSwitch from './AcceptingSwitch';
import PropTypes from 'prop-types';
import React from 'react';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import {Helmet} from 'react-helmet';
import {ORGANIZATION_FRAGMENT} from '../utils';
import {Text} from '@chakra-ui/core';
import {gql} from '@apollo/client';

const ON_ORGANIZATION_UPDATED = gql`
  subscription OnOrganizationUpdated {
    organizationUpdated {
      ...OrganizationFragment
    }
  }
  ${ORGANIZATION_FRAGMENT}
`;

export default function OrganizationStatus(props) {
  useEffectOnce(() =>
    // subscribeToMore returns a function to unsubscribe
    // we implicitly return subscribeToMore() to cleanup on unmount
    props.subscribeToMore({
      document: ON_ORGANIZATION_UPDATED
    })
  );

  return (
    <>
      <Helmet>
        <title>{props.organization.name}</title>
      </Helmet>
      <Text fontSize="sm" mr="2">
        {props.organization.accepting ? 'On' : 'Off'}
      </Text>
      <AcceptingSwitch isChecked={props.organization.accepting} />
      {/* <Button ml="2" variant="outline" size="sm">
        {props.organization.name}
      </Button> */}
    </>
  );
}

OrganizationStatus.propTypes = {
  organization: PropTypes.object.isRequired,
  subscribeToMore: PropTypes.func.isRequired
};
