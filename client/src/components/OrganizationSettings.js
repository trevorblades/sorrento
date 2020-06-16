import ChatBubble from './ChatBubble';
import MessageForm from './MessageForm';
import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Stack
} from '@chakra-ui/core';
import {createWelcomeMessage} from 'common';
import {format} from 'phone-fns';

const defaults = {
  keyword: 'REMOVE'
};

export default function OrganizationSettings(props) {
  const [message, setMessage] = useState('welcomeMessage');
  const [organization, setOrganization] = useState(props.data.organization);

  function handleMessageChange(event) {
    setMessage(event.target.value);
  }

  function handleInputChange(event) {
    const {name, value} = event.target;
    setOrganization(prevOrganization => ({
      ...prevOrganization,
      [name]: value
    }));
  }

  return (
    <>
      <Box p={[5, 6]}>
        <Stack spacing="12" mx="auto" maxW="containers.lg">
          <Box>
            <Heading mb="6" fontSize="3xl">
              Organization settings
            </Heading>
            <Stack maxW="containers.sm" spacing="4">
              <FormControl>
                <FormLabel>Organization name</FormLabel>
                <Input defaultValue={organization.name} />
              </FormControl>
              <FormControl>
                <FormLabel>SMS number</FormLabel>
                <Input
                  value={format('(NNN) NNN-NNNN', organization.phone.slice(2))}
                  isDisabled
                />
              </FormControl>
              {/* TODO: use sliders for numbers */}
              <FormControl>
                <FormLabel>Queue limit</FormLabel>
                <NumberInput
                  min={1}
                  max={100}
                  isRequired
                  name="queueLimit"
                  defaultValue={organization.queueLimit}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel>Active agents</FormLabel>
                <NumberInput
                  min={1}
                  name="activeAgents"
                  isRequired
                  defaultValue={organization.activeAgents}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormHelperText>
                  The number of people serving customers
                </FormHelperText>
              </FormControl>
              <FormControl>
                <FormLabel>Average handle time</FormLabel>
                <NumberInput
                  min={1}
                  name="averageHandleTime"
                  isRequired
                  defaultValue={organization.averageHandleTime}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormHelperText>
                  The average amount of time (in minutes) to finish serving a
                  customer
                </FormHelperText>
              </FormControl>
              <FormControl>
                <FormLabel>Self-remove keyword</FormLabel>
                <Input
                  name="keyword"
                  placeholder={defaults.keyword}
                  onChange={handleInputChange}
                  value={organization.keyword}
                />
                <FormHelperText>
                  The keyword that your customers can text to remove themselves
                  from your waitlist (case-insensitive)
                </FormHelperText>
              </FormControl>
            </Stack>
          </Box>
          <Box>
            <Heading fontSize="3xl" mb="6">
              Configure responses
            </Heading>
            <Flex align="flex-start">
              <Box flexShrink="0" mr="5" w="full" maxW="containers.sm">
                <Select
                  size="lg"
                  mb="4"
                  onChange={handleMessageChange}
                  value={message}
                >
                  <option value="welcomeMessage">Welcome</option>
                  <option value="notAcceptingMessage">Not accepting</option>
                  <option value="removedMessage">Removed</option>
                  <option value="notRemovedMessage">Not removed</option>
                  <option value="limitExceededMessage">Limit exceeded</option>
                </Select>
                <MessageForm
                  message={message}
                  organization={organization}
                  onInputChange={handleInputChange}
                />
              </Box>
              <Flex
                direction="column"
                px="7px"
                overflow="hidden"
                mx="auto"
                w="full"
              >
                <ChatBubble>
                  {/[rR]emovedMessage$/.test(message)
                    ? organization.keyword || defaults.keyword
                    : 'Bonnie'}
                </ChatBubble>
                <ChatBubble fromThem>
                  {message === 'welcomeMessage'
                    ? createWelcomeMessage(organization, 1)
                    : organization[message]}
                </ChatBubble>
              </Flex>
            </Flex>
          </Box>
        </Stack>
      </Box>
      <Box
        px="4"
        py="3"
        textAlign="right"
        position="sticky"
        zIndex="sticky"
        bottom="0"
        mt="auto"
        borderTopWidth="1px"
        bg="white"
      >
        <Box mx="auto" maxW="containers.lg">
          <Button size="lg" variantColor="green">
            Save changes
          </Button>
        </Box>
      </Box>
    </>
  );
}

OrganizationSettings.propTypes = {
  data: PropTypes.object.isRequired
};
