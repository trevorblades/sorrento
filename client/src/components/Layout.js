import PropTypes from 'prop-types';
import React from 'react';
import {Helmet} from 'react-helmet';

export default function Layout(props) {
  return (
    <>
      <Helmet defaultTitle="W8UP" titleTemplate="%s - W8UP" />
      {props.children}
    </>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired
};
