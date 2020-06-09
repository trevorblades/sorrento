import Header from '../components/Header';
import History from '../components/History';
import Layout from '../components/Layout';
import ListCustomers from '../components/ListCustomers';
import NoSsr from '@mpth/react-no-ssr';
import PropTypes from 'prop-types';
import React from 'react';
import RequireAuth from '../components/RequireAuth';
import Waitlist from '../components/Waitlist';
import {Flex, Text} from '@chakra-ui/core';
import {Router} from '@reach/router';

function NotFound() {
  return <Text>Not found</Text>;
}

export default function App(props) {
  return (
    <Layout>
      <NoSsr>
        <RequireAuth>
          <Flex direction="column" minH="100vh">
            <Header />
            <Flex
              flexGrow="1"
              direction="column"
              as={Router}
              location={props.location}
            >
              <ListCustomers path="/app" served={false} component={Waitlist} />
              <ListCustomers path="/app/customers" served component={History} />
              <NotFound default />
            </Flex>
          </Flex>
        </RequireAuth>
      </NoSsr>
    </Layout>
  );
}

App.propTypes = {
  location: PropTypes.object.isRequired
};
