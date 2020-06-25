import OrgSettingsForm from './OrgSettingsForm';
import PropTypes from 'prop-types';
import React from 'react';
import {ModalBody, Spinner, Text} from '@chakra-ui/core';
import {gql, useQuery} from '@apollo/client';

const GET_ORG_DETAILS = gql`
  query GetOrgDetails($id: ID!) {
    organization(id: $id) {
      id
      name
      phone
      queueLimit
      averageHandleTime
      activeAgents
      keyword
      person
      welcomeMessage
      queueMessage
      queueEmptyMessage
      notAcceptingMessage
      readyMessage
      removedMessage
      notRemovedMessage
      limitExceededMessage
    }
  }
`;

export default function OrgSettingsModalContent({queryOptions}) {
  const {data, loading, error} = useQuery(GET_ORG_DETAILS, queryOptions);

  if (loading) {
    return (
      <ModalBody>
        <Spinner />
      </ModalBody>
    );
  }

  if (loading) {
    return (
      <ModalBody>
        <Text color="red.500">{error.message}</Text>
      </ModalBody>
    );
  }

  return <OrgSettingsForm organization={data.organization} />;
}

OrgSettingsModalContent.propTypes = {
  queryOptions: PropTypes.object.isRequired
};
