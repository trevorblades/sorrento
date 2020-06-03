import React, {createContext} from 'react';
import {Button} from '@chakra-ui/core';
import {gql} from '@apollo/client';

export const DarkButton = props => (
  <Button
    bg="gray.900"
    _hover={{bg: 'gray.800'}}
    _active={{bg: 'gray.700'}}
    color="white"
    {...props}
  />
);

export const UserContext = createContext();

export const CUSTOMER_FRAGMENT = gql`
  fragment CustomerFragment on Customer {
    id
    name
    waitingSince
    servedAt
    servedBy {
      name
    }
  }
`;

export const ORGANIZATION_FRAGMENT = gql`
  fragment OrganizationFragment on Organization {
    id
    name
    accepting
  }
`;
