import Header from '../../components/Header';
import Layout from '../../components/Layout';
import ListCustomers from '../../components/ListCustomers';
import NoSsr from '@mpth/react-no-ssr';
import PropTypes from 'prop-types';
import React from 'react';
import RequireAuth from '../../components/RequireAuth';
import Waitlist from '../../components/Waitlist';

export default function App(props) {
  return (
    <Layout>
      <NoSsr>
        <RequireAuth>
          <Header location={props.location} />
          <ListCustomers component={Waitlist} />
        </RequireAuth>
      </NoSsr>
    </Layout>
  );
}

App.propTypes = {
  location: PropTypes.object.isRequired
};
