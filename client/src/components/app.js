import AppInner from './app-inner';
import PropTypes from 'prop-types';
import React, {useState} from 'react';
import io from 'socket.io-client';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import {Box, Spinner, Text} from '@chakra-ui/core';
import {useLazyRef} from '@shopify/react-hooks';

export default function App(props) {
  // create a socket connection
  const {current: socket} = useLazyRef(() =>
    io(process.env.GATSBY_API_URL, {
      transportOptions: {
        polling: {
          extraHeaders: {
            Authorization: `Bearer ${props.user.token}`
          }
        }
      }
    })
  );

  // initialize state
  const [state, setState] = useState({
    loading: true,
    error: null
  });

  useEffectOnce(() => {
    // open the connection when the component mounts
    socket.open();

    // set up error handler
    socket.on('error', error => {
      setState({
        error,
        loading: false
      });
    });

    // merge new partial data into existing data
    socket.on('data', data => {
      setState(prevState => ({
        error: null,
        loading: false,
        data: {
          ...prevState.data,
          ...data
        }
      }));
    });

    // close the connection when the component unmounts
    return () => socket.close();
  });

  if (state.loading) {
    return (
      <Box m="auto">
        <Spinner />
      </Box>
    );
  }

  if (state.error) {
    return <Text color="red.500">{state.error}</Text>;
  }

  return <AppInner user={props.user} data={state.data} socket={socket} />;
}

App.propTypes = {
  user: PropTypes.object.isRequired
};
