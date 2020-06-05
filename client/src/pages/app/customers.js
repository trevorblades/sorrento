import Header from '../../components/Header';
import History from '../../components/History';
import Layout from '../../components/Layout';
import ListCustomers from '../../components/ListCustomers';
import NoSsr from '@mpth/react-no-ssr';
import PropTypes from 'prop-types';
import React from 'react';
import RequireAuth from '../../components/RequireAuth';

export default function Customers(props) {
  return (
    <Layout>
      <NoSsr>
        <RequireAuth>
          <Header location={props.location} />
          <ListCustomers component={History} />
        </RequireAuth>
      </NoSsr>
    </Layout>
  );
}

Customers.propTypes = {
  location: PropTypes.object.isRequired
};
