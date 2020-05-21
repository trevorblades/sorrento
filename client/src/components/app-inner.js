import PropTypes from 'prop-types';
import React, {useMemo} from 'react';
import Timer from './timer';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Grid,
  Heading,
  List,
  ListItem
} from '@chakra-ui/core';

export default function AppInner(props) {
  const {customers, isAccepting} = props.data;

  const waitingCustomers = useMemo(
    () => customers.filter(customer => !customer.servedAt),
    [customers]
  );

  function handleNextClick() {
    props.socket.emit('serve', {id: waitingCustomers[0].id});
  }

  function handleAcceptingChange(event) {
    props.socket.emit('accept', {value: event.target.checked});
  }

  return (
    <Grid templateColumns="2fr 1fr" flexGrow="1">
      <Flex direction="column">
        <Box p="10">
          <Checkbox isChecked={isAccepting} onChange={handleAcceptingChange}>
            Accepting customers
          </Checkbox>
          <Heading as="h3" fontSize="3xl" mb="4">
            Waiting:
          </Heading>
          <List spacing="4">
            {waitingCustomers.map(customer => (
              <Flex
                as={ListItem}
                key={customer.id}
                justify="space-between"
                align="center"
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
              </Flex>
            ))}
          </List>
        </Box>
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
      </Flex>
      <Box p="10" bg="gray.50">
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
                <div>Served by {customer.barberName}</div>
              </ListItem>
            ))}
        </List>
      </Box>
    </Grid>
  );
}

AppInner.propTypes = {
  socket: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired
};
