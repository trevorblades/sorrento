import React, { ComponentProps, useEffect } from "react";
import auston from "../assets/auston.png";
import {
  AcceptingChangedDocument,
  AcceptingChangedSubscription,
  Barber,
  Customer,
  CustomerAddedDocument,
  CustomerAddedSubscription,
  CustomerRemovedDocument,
  CustomerRemovedSubscription,
  CustomerUpdatedDocument,
  useListCustomersQuery,
} from "../generated/graphql";
import { AcceptingSwitch } from "./AcceptingSwitch";
import {
  Avatar,
  Box,
  Button,
  Center,
  Flex,
  HStack,
  Heading,
  Img,
  List,
  ListItem,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  Stack,
  StackDivider,
  Text,
  chakra,
} from "@chakra-ui/react";
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { RemoveCustomer } from "./RemoveCustomer";
import { ServeCustomer } from "./ServeCustomer";
import { Timer } from "./Timer";
import { ToggleColorMode } from "./ToggleColorMode";

type WaitlistProps = {
  user: {
    nowServing?: Pick<Customer, "name"> | null;
  } & Pick<Barber, "name"> &
    ComponentProps<typeof ServeCustomer>["user"];
};

export function Waitlist({ user }: WaitlistProps) {
  const { data, loading, error, subscribeToMore, client } =
    useListCustomersQuery();

  /**
   * Set up subscriptions for when customers are added, removed, or updated.
   */

  useEffect(
    () =>
      subscribeToMore<AcceptingChangedSubscription>({
        document: AcceptingChangedDocument,
        updateQuery: (prev, { subscriptionData }) => ({
          ...prev,
          isAccepting: subscriptionData.data.acceptingChanged,
        }),
      }),
    [subscribeToMore]
  );

  useEffect(
    () =>
      subscribeToMore<CustomerAddedSubscription>({
        document: CustomerAddedDocument,
        updateQuery: (prev, { subscriptionData }) => ({
          ...prev,
          customers: [subscriptionData.data.customerAdded, ...prev.customers],
        }),
      }),
    [subscribeToMore]
  );

  useEffect(
    () =>
      subscribeToMore<CustomerRemovedSubscription>({
        document: CustomerRemovedDocument,
        updateQuery: (prev, { subscriptionData }) => ({
          ...prev,
          customers: prev.customers.filter(
            (customer) =>
              customer.id !== subscriptionData.data.customerRemoved.id
          ),
        }),
      }),
    [subscribeToMore]
  );

  useEffect(
    () => subscribeToMore({ document: CustomerUpdatedDocument }),
    [subscribeToMore]
  );

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner />
      </Center>
    );
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  if (!data) {
    throw new Error("No data");
  }

  const { isAccepting, customers } = data;

  return (
    <Flex minH="100vh" direction="column">
      <Flex
        as="header"
        justify="space-between"
        align="center"
        px="4"
        py="2"
        borderBottomWidth={1}
        pos="sticky"
        top="0"
      >
        <HStack spacing="4">
          <chakra.h1 fontSize="2xl" fontWeight="bold">
            eSorrento
          </chakra.h1>
          <HStack as="label">
            <AcceptingSwitch isAccepting={isAccepting} />
            <chakra.span textTransform="uppercase">
              {isAccepting ? "On" : "Off"}
            </chakra.span>
          </HStack>
        </HStack>
        <Menu closeOnSelect={false}>
          <Button as={MenuButton} variant="ghost" pl="1" rounded="full">
            <HStack>
              <Avatar name={user.name} size="sm" />
              <span>{user.name}</span>
            </HStack>
          </Button>
          <MenuList>
            <ToggleColorMode />
            <MenuItem
              onClick={() => {
                localStorage.removeItem("token");
                client.resetStore();
              }}
            >
              Log out
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
      {customers.length ? (
        <Stack
          as={List}
          divider={<StackDivider />}
          maxW="container.lg"
          mx="auto"
          mb="auto"
          w="full"
          px={{ lg: 6 }}
        >
          {customers.map((customer) => (
            <ListItem
              key={customer.id}
              py={[3, 4, 5]}
              px={{
                base: 4,
                sm: 5,
                lg: 0,
              }}
            >
              <Box fontWeight="bold" fontSize="xl">
                {customer.phone}
              </Box>
              <Text>{customer.name}</Text>
              {customer.messages.map((message) => (
                <Text key={message.id}>{message.text}</Text>
              ))}
              <HStack spacing="2" mt="3">
                <ServeCustomer
                  borderRadius="full"
                  leftIcon={<FiCheckCircle />}
                  size="sm"
                  customer={customer}
                  user={user}
                >
                  Serve
                </ServeCustomer>
                <RemoveCustomer customer={customer} />
                <Text fontSize="sm" color="gray.500">
                  <Timer date={new Date(customer.waitingSince)} />
                </Text>
              </HStack>
            </ListItem>
          ))}
        </Stack>
      ) : (
        <Box m="auto">
          <Img mb="4" sx={{ h: 200 }} src={auston.src} />
          <Heading textAlign="center" fontSize="2xl">
            Your list is clear
          </Heading>
        </Box>
      )}
      <Box bg="gray.900" color="white" position="sticky" bottom="0">
        <Flex maxW="container.lg" mx="auto" px={[4, 5]} py="3" align="center">
          {user.nowServing && (
            <Box mr="4" overflow="hidden">
              <Text color="gray.500" fontSize="sm">
                Now serving
              </Text>
              <Text fontWeight="medium" noOfLines={1}>
                {user.nowServing.name}
              </Text>
            </Box>
          )}
          <ServeCustomer
            size="lg"
            borderRadius="full"
            colorScheme="blue"
            ml="auto"
            rightIcon={<FiArrowRight />}
            flexShrink="0"
            customer={customers[0]}
            user={user}
          >
            <span>
              Next{" "}
              <chakra.span
                display={{
                  base: "none",
                  md: "inline",
                }}
              >
                customer
              </chakra.span>
            </span>
          </ServeCustomer>
        </Flex>
      </Box>
    </Flex>
  );
}
