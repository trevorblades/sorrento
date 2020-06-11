import PropTypes from 'prop-types';
import React from 'react';
import {Box, Spinner, Text} from '@chakra-ui/core';
import {useQuery} from '@apollo/client';

export default function QueryLoader({
  query,
  queryOptions,
  component,
  ...props
}) {
  const {loading, error, ...result} = useQuery(query, queryOptions);

  if (loading) {
    return (
      <Box m="auto">
        <Spinner />
      </Box>
    );
  }

  if (error) {
    return <Text color="red.500">{error.message}</Text>;
  }

  return React.createElement(component, {...result, ...props});
}

QueryLoader.propTypes = {
  component: PropTypes.func.isRequired,
  query: PropTypes.object.isRequired,
  queryOptions: PropTypes.object
};
