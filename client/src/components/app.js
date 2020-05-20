import AppInner from './app-inner';
import PropTypes from 'prop-types';
import React, {useState} from 'react';
import io from 'socket.io-client';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import {Text} from '@chakra-ui/core';
import {useLazyRef} from '@shopify/react-hooks';

export default function App(props) {
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

  const [state, setState] = useState({
    loading: true,
    error: null
  });

  useEffectOnce(() => {
    socket.open();

    socket.on('error', error => {
      setState({
        error,
        loading: false
      });
    });

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

    return () => socket.close();
  });

  if (state.loading) {
    return <Text>Loading...</Text>;
  }

  if (state.error) {
    return <Text color="red.500">{state.error}</Text>;
  }

  return <AppInner data={state.data} socket={socket} />;
}

App.propTypes = {
  user: PropTypes.object.isRequired
};
