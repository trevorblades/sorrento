import PropTypes from 'prop-types';
import React, {useMemo} from 'react';
import Timer from './timer';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import {
  Avatar,
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  List,
  ListItem,
  Switch,
  Text
} from '@chakra-ui/core';
import {
  CUSTOMER_FRAGMENT,
  DarkButton,
  LOGO_HEIGHT,
  LOGO_MARGIN,
  ORGANIZATION_FRAGMENT
} from '../utils';

import {FaArrowRight} from 'react-icons/fa';
import {format} from 'date-fns';
import {gql, useMutation} from '@apollo/client';

function PanelHeading(props) {
  return (
    <Heading
      as="h3"
      fontSize="4xl"
      mb="6"
      textTransform="uppercase"
      {...props}
    />
  );
}

function PanelListItem({title, subtitle, children, ...props}) {
  return (
    <Flex as={ListItem} justify="space-between" align="center" {...props}>
      <div>
        <Text lineHeight="normal" fontSize="2xl" fontWeight="medium">
          {title}
        </Text>
        <Text lineHeight="normal" fontSize="xl">
          {subtitle}
        </Text>
      </div>
      <Box flexShrink="0">{children}</Box>
    </Flex>
  );
}

PanelListItem.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired
};

function UserAvatar(props) {
  return (
    <>
      <Avatar mr="2" fontSize="sm" size="xs" name={props.user.name} />
      <span>
        <Box
          as="span"
          display={{
            base: 'none',
            md: 'inline'
          }}
        >
          Logged in as{' '}
        </Box>
        {props.user.name}
      </span>
    </>
  );
}

UserAvatar.propTypes = {
  user: PropTypes.object.isRequired
};

const SERVE_CUSTOMER = gql`
  mutation ServeCustomer($id: ID!) {
    serveCustomer(id: $id) {
      ...CustomerFragment
    }
  }
  ${CUSTOMER_FRAGMENT}
`;

function ServeButton(props) {
  const [serveCustomer, {loading}] = useMutation(SERVE_CUSTOMER, {
    variables: {
      id: props.customer.id
    }
  });

  return (
    <DarkButton isLoading={loading} mr="3" onClick={serveCustomer}>
      Serve
    </DarkButton>
  );
}

ServeButton.propTypes = {
  customer: PropTypes.object.isRequired
};

function NextButton({mutationOptions, ...props}) {
  const [nextCustomer, {loading}] = useMutation(
    SERVE_CUSTOMER,
    mutationOptions
  );

  return (
    <DarkButton
      mt="auto"
      w="full"
      rounded="none"
      h="100px"
      fontSize="3xl"
      position="sticky"
      bottom="0"
      textTransform="uppercase"
      rightIcon={FaArrowRight}
      isLoading={loading}
      onClick={nextCustomer}
      {...props}
    >
      <span>
        Next{' '}
        <Box
          as="span"
          display={{
            display: 'none',
            md: 'inline'
          }}
        >
          customer
        </Box>
      </span>
    </DarkButton>
  );
}

NextButton.propTypes = {
  mutationOptions: PropTypes.object.isRequired
};

const REMOVE_CUSTOMER = gql`
  mutation RemoveCustomer($id: ID!) {
    removeCustomer(id: $id) {
      ...CustomerFragment
    }
  }
  ${CUSTOMER_FRAGMENT}
`;

function RemoveButton(props) {
  const [removeCustomer, {loading}] = useMutation(REMOVE_CUSTOMER, {
    variables: {
      id: props.customer.id
    }
  });

  return (
    <Button
      isLoading={loading}
      onClick={() => {
        if (
          confirm(`Are you sure you want to remove "${props.customer.name}"?`)
        ) {
          removeCustomer();
        }
      }}
    >
      Remove
    </Button>
  );
}

RemoveButton.propTypes = {
  customer: PropTypes.object.isRequired
};

const PANEL_PADDING = [6, 8, 10];

const UPDATE_ORGANIZATION = gql`
  mutation UpdateOrganization($input: UpdateOrganizationInput!) {
    updateOrganization(input: $input) {
      ...OrganizationFragment
    }
  }
  ${ORGANIZATION_FRAGMENT}
`;

function AcceptingSwitch(props) {
  const [updateOrganization, {loading}] = useMutation(UPDATE_ORGANIZATION);

  function handleChange(event) {
    if (
      event.target.checked ||
      confirm('Are you sure you want to stop accepting customers?')
    ) {
      updateOrganization({
        variables: {
          input: {
            accepting: event.target.checked
          }
        }
      });
    }
  }

  return (
    <>
      <Text ml="auto" mr="2" as="label" htmlFor="accepting">
        Accepting{' '}
        <Box
          as="span"
          display={{
            base: 'none',
            md: 'inline'
          }}
        >
          customers
        </Box>
      </Text>
      <Switch
        display="flex"
        id="accepting"
        isDisabled={loading}
        onChange={handleChange}
        {...props}
      />
    </>
  );
}

export default function AppInner(props) {
  const {user, customers, organization} = props.data;

  useEffectOnce(() =>
    // subscribeToMore returns a function to unsubscribe
    // we implicitly return subscribeToMore() to cleanup on unmount
    props.subscribeToMore({
      document: gql`
        subscription OnOrganizationUpdated {
          organizationUpdated {
            id
            accepting
          }
        }
      `
    })
  );

  const waitingCustomers = useMemo(
    () =>
      customers
        .filter(customer => !customer.servedAt)
        .sort((a, b) => new Date(a.waitingSince) - new Date(b.waitingSince)),
    [customers]
  );

  const servedCustomers = useMemo(
    () =>
      customers
        .filter(customer => customer.servedAt)
        .sort((a, b) => new Date(b.servedAt) - new Date(a.servedAt)),
    [customers]
  );

  return (
    <Grid
      templateColumns={{
        base: '1fr',
        lg: 'repeat(2, 1fr)',
        xl: '2fr 1fr'
      }}
      flexGrow="1"
    >
      <Flex direction="column">
        <Box px={PANEL_PADDING} pb={PANEL_PADDING}>
          <Flex
            h={LOGO_HEIGHT}
            my={LOGO_MARGIN}
            align="center"
            justify="flex-end"
          >
            <Box display={{lg: 'none'}}>
              <UserAvatar user={user} />
            </Box>
            <AcceptingSwitch isChecked={organization.accepting} />
          </Flex>
          <PanelHeading>Waiting</PanelHeading>
          <List spacing="6">
            {waitingCustomers.map((customer, index) => (
              <PanelListItem
                key={customer.id}
                title={`${index + 1}. ${customer.name}`}
                subtitle={<Timer date={new Date(customer.waitingSince)} />}
              >
                <ServeButton customer={customer} />
                <RemoveButton customer={customer} />
              </PanelListItem>
            ))}
          </List>
        </Box>
        <NextButton
          isDisabled={!waitingCustomers.length}
          mutationOptions={{
            variables: {
              id: waitingCustomers[0]?.id
            }
          }}
        />
      </Flex>
      <Box
        h="100vh"
        position="sticky"
        top="0"
        flexDirection="column"
        px={PANEL_PADDING}
        bg="gray.50"
        overflow="hidden"
        display={{
          base: 'none',
          lg: 'flex'
        }}
      >
        <Flex flexShrink="0" h={LOGO_HEIGHT} my={LOGO_MARGIN} align="center">
          <UserAvatar user={user} />
        </Flex>
        {servedCustomers.length ? (
          <>
            <PanelHeading>Served today</PanelHeading>
            <List spacing="6">
              {servedCustomers.map(customer => (
                <PanelListItem
                  key={customer.id}
                  title={customer.name}
                  subtitle={`Served by ${customer.servedBy.name}`}
                >
                  <Text color="gray.500">
                    {format(new Date(customer.servedAt), 'p')}
                  </Text>
                </PanelListItem>
              ))}
            </List>
          </>
        ) : (
          <Box textAlign="center" m="auto">
            <Box fontSize="5xl">💈</Box>
            <Text fontSize="lg" color="gray.500">
              No customers have been served today
            </Text>
          </Box>
        )}
      </Box>
    </Grid>
  );
}

AppInner.propTypes = {
  subscribeToMore: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired
};
