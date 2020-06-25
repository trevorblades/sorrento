import Layout from '../../components/Layout';
import OrgInner from '../../components/OrgInner';
import PropTypes from 'prop-types';
import React from 'react';
import RequireAuth from '../../components/RequireAuth';

export default function Org(props) {
  return (
    <Layout>
      <RequireAuth>
        <OrgInner
          queryOptions={{
            variables: {organizationId: props['*']}
          }}
        />
      </RequireAuth>
    </Layout>
  );
}

Org.propTypes = {
  '*': PropTypes.string.isRequired
};
