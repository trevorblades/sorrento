import {gql} from '@apollo/client';

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

export const WAITLIST_QUERY = gql`
  query WaitlistQuery {
    customers(served: false) {
      ...CustomerFragment
    }
    nowServing {
      name
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

export const GET_LOGGED_IN = gql`
  query GetLoggedIn {
    isLoggedIn @client
  }
`;
