import App from '../../components/app';
import NoSsr from '@mpth/react-no-ssr';
import React from 'react';
import RequireAuth from '../../components/require-auth';
import {Helmet} from 'react-helmet';

export default function List() {
  return (
    <>
      <Helmet defaultTitle="w8up" titleTemplate="%s - w8up" />
      <NoSsr>
        <RequireAuth>
          <App />
        </RequireAuth>
      </NoSsr>
    </>
  );
}
