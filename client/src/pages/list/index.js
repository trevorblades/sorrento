import App from '../../components/app';
import NoSsr from '@mpth/react-no-ssr';
import React from 'react';
import RequireAuth from '../../components/require-auth';
import {Helmet} from 'react-helmet';

export default function List() {
  return (
    <>
      <Helmet defaultTitle="Sorrento" titleTemplate="%s - Sorrento" />
      <NoSsr>
        <RequireAuth>
          <App user={{}} />
        </RequireAuth>
      </NoSsr>
    </>
  );
}
