import {createContext} from 'react';
import {gql} from '@apollo/client';

export const LogOutContext = createContext();

export const CUSTOMER_FRAGMENT = gql`
  fragment CustomerFragment on Customer {
    id
    name
    phone
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

export const LIST_ORGANIZATIONS = gql`
  query ListOrganizations {
    me {
      id
      name
    }
    organizations {
      id
      name
    }
  }
`;

export const WAITLIST_QUERY = gql`
  query WaitlistQuery($organizationId: ID!) {
    me {
      id
      name
      nowServing {
        name
      }
    }
    organization(id: $organizationId) {
      id
      name
      accepting
      customers(served: false) {
        id
        name
        phone
        waitingSince
      }
    }
  }
`;

export const SERVE_CUSTOMER = gql`
  mutation ServeCustomer($id: ID!) {
    serveCustomer(id: $id) {
      ...CustomerFragment
    }
  }
  ${CUSTOMER_FRAGMENT}
`;

export const ON_CUSTOMER_SERVED = gql`
  subscription OnCustomerServed {
    customerServed {
      ...CustomerFragment
    }
  }
  ${CUSTOMER_FRAGMENT}
`;
