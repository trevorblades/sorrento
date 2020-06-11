import AppInner from '../components/AppInner';
import History from '../components/History';
import Layout from '../components/Layout';
import NoSsr from '@mpth/react-no-ssr';
import NotFound from '../components/NotFound';
import OrganizationSettings from '../components/OrganizationSettings';
import PropTypes from 'prop-types';
import QueryLoader from '../components/QueryLoader';
import React from 'react';
import RequireAuth from '../components/RequireAuth';
import Waitlist from '../components/Waitlist';
import {
  CUSTOMER_FRAGMENT,
  ORGANIZATION_FRAGMENT,
  WAITLIST_QUERY
} from '../utils';
import {Flex} from '@chakra-ui/core';
import {Router} from '@reach/router';
import {gql} from '@apollo/client';

const APP_QUERY = gql`
  query AppQuery {
    me {
      name
    }
    organization {
      ...OrganizationFragment
    }
  }
  ${ORGANIZATION_FRAGMENT}
`;

const HISTORY_QUERY = gql`
  query HistoryQuery {
    customers(served: true) {
      ...CustomerFragment
    }
  }
  ${CUSTOMER_FRAGMENT}
`;

const GET_ORGANIZATION = gql`
  query GetOrganization {
    organization {
      ...OrganizationFragment
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
  ${ORGANIZATION_FRAGMENT}
`;

export default function App(props) {
  return (
    <Layout>
      <NoSsr>
        <RequireAuth>
          <Flex direction="column" minH="100vh">
            <QueryLoader component={AppInner} query={APP_QUERY}>
              <Flex
                flexGrow="1"
                direction="column"
                as={Router}
                location={props.location}
              >
                <QueryLoader
                  path="/app"
                  component={Waitlist}
                  query={WAITLIST_QUERY}
                  queryOptions={{fetchPolicy: 'network-only'}}
                />
                <QueryLoader
                  path="/app/customers"
                  component={History}
                  query={HISTORY_QUERY}
                  queryOptions={{fetchPolicy: 'network-only'}}
                />
                <QueryLoader
                  path="/app/organization"
                  component={OrganizationSettings}
                  query={GET_ORGANIZATION}
                />
                <NotFound default />
              </Flex>
            </QueryLoader>
          </Flex>
        </RequireAuth>
      </NoSsr>
    </Layout>
  );
}

App.propTypes = {
  location: PropTypes.object.isRequired
};
