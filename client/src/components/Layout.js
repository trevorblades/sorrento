import PropTypes from 'prop-types';
import React from 'react';
import {Helmet} from 'react-helmet';

export default function Layout(props) {
  return (
    <>
      <Helmet defaultTitle="W8UP" titleTemplate="%s - W8UP">
        <link
          rel="icon"
          href="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/billiards_1f3b1.png"
        />
      </Helmet>
      {props.children}
    </>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired
};
