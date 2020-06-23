import AppInner from '../../components/AppInner';
import Layout from '../../components/Layout';
import NoSsr from '@mpth/react-no-ssr';
import React from 'react';
import RequireAuth from '../../components/RequireAuth';

export default function App() {
  return (
    <Layout>
      <NoSsr>
        <RequireAuth>
          <AppInner />
        </RequireAuth>
      </NoSsr>
    </Layout>
  );
}
