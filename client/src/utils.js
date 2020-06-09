import {createContext} from 'react';
import {gql} from '@apollo/client';

export const UserContext = createContext();

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

export const LIST_CUSTOMERS = gql`
  query ListCustomers($served: Boolean!) {
    customers(served: $served) {
      ...CustomerFragment
    }
    nowServing {
      ...CustomerFragment
    }
  }
  ${CUSTOMER_FRAGMENT}
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
