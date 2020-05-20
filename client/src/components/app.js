import PropTypes from 'prop-types';
import React, {useMemo, useState} from 'react';
import io from 'socket.io-client';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import useInterval from 'react-use/lib/useInterval';
import {
  Box,
  Button,
  Checkbox,
  Grid,
  Heading,
  List,
  ListItem
} from '@chakra-ui/core';
import {useLazyRef} from '@shopify/react-hooks';

function minutesSinceNow(date) {
  const ms = Date.now() - date;
  return Math.floor(ms / 1000 / 60);
}

function Timer(props) {
  const [minutes, setMinutes] = useState(minutesSinceNow(props.date));

  useInterval(() => {
    setMinutes(minutesSinceNow(props.date));
  }, 1000);

  return (
    <div>
      Added{' '}
      {minutes < 1
        ? 'less than a minute'
        : `${minutes} minute${minutes === 1 ? '' : 's'}`}{' '}
      ago
    </div>
  );
}

Timer.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired
};

function AppInner(props) {
  const {customers, isAccepting} = props.state;

  const waitingCustomers = useMemo(
    () => customers.filter(customer => !customer.servedAt),
    [customers]
  );

  function handleNextClick() {
    props.socket.emit('serve', {id: waitingCustomers[0].id});
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      px="10"
      maxWidth="800px"
      mx="auto"
      minHeight="100vh"
    >
      <Box
        py="4"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb="10"
      >
        <Heading fontSize="4xl">💈 Sorrento</Heading>
        <Checkbox
          isChecked={isAccepting}
          onChange={e => props.socket.emit('accept', {value: e.target.checked})}
        >
          Accepting customers
        </Checkbox>
      </Box>
      <Grid gap="10" templateColumns="repeat(2, 1fr)">
        <div>
          <Heading as="h3" fontSize="3xl" mb="4">
            Waiting:
          </Heading>
          <List spacing="4">
            {waitingCustomers.map(customer => {
              return (
                <ListItem
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  key={customer.id}
                >
                  <div>
                    <div>{customer.name}</div>
                    <Timer date={new Date(customer.waitingSince)} />
                  </div>
                  <div>
                    <Button
                      size="sm"
                      mr="2"
                      onClick={() =>
                        props.socket.emit('serve', {id: customer.id})
                      }
                    >
                      Serve
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        props.socket.emit('remove', {id: customer.id})
                      }
                    >
                      Remove
                    </Button>
                  </div>
                </ListItem>
              );
            })}
          </List>
        </div>
        <div>
          <Heading as="h3" fontSize="3xl" mb="4">
            Served:
          </Heading>
          <List>
            {customers
              .filter(customer => customer.servedAt)
              .sort((a, b) => new Date(b.servedAt) - new Date(a.servedAt))
              .map(customer => (
                <ListItem key={customer.id}>
                  {customer.name} served at{' '}
                  {new Date(customer.servedAt).toLocaleTimeString()}
                </ListItem>
              ))}
          </List>
        </div>
      </Grid>
      <Button
        mt="auto"
        w="full"
        rounded="none"
        h="20"
        fontSize="2xl"
        variantColor="blue"
        disabled={!waitingCustomers.length}
        onClick={handleNextClick}
      >
        Next customer
      </Button>
    </Box>
  );
}

AppInner.propTypes = {
  socket: PropTypes.object.isRequired,
  state: PropTypes.object.isRequired
};

export default function App(props) {
  const {current: socket} = useLazyRef(() => io(process.env.GATSBY_API_URL));
  const [state, setState] = useState(null);

  useEffectOnce(() => {
    socket.open();
    socket.on('data', data =>
      setState(prevState => ({
        ...prevState,
        ...data
      }))
    );
    return () => socket.close();
  });

  return (
    <div>
      <Button onClick={props.removeToken}>Log out</Button>
      {state ? (
        <AppInner state={state} socket={socket} />
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}

App.propTypes = {
  removeToken: PropTypes.func.isRequired
};
