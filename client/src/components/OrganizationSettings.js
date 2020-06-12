import ChatBubble from './ChatBubble';
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
  Stack,
  Textarea
} from '@chakra-ui/core';
import {createWelcomeMessage} from 'common';
import {format} from 'phone-fns';

function MessageForm(props) {
  switch (props.message) {
    case 'welcomeMessage':
      return (
        <>
          <FormControl>
            <Textarea
              resize="none"
              name="welcomeMessage"
              onChange={props.onInputChange}
              value={props.organization.welcomeMessage}
            />
            <FormHelperText>
              You may use the &#123;KEYWORD&#125; and &#123;QUEUE_MESSAGE&#125;
              variables in this message
            </FormHelperText>
          </FormControl>
          <FormControl>
            <FormLabel>
              &#123;QUEUE_MESSAGE&#125; variable when there are people in the
              queue
            </FormLabel>
            <Textarea
              resize="none"
              name="queueMessage"
              onChange={props.onInputChange}
              value={props.organization.queueMessage}
            />
            <FormHelperText>
              You may use the &#123;IS&#125;, &#123;PERSON&#125;, and
              &#123;ESTIMATED_WAIT_TIME&#125; variables in this message
            </FormHelperText>
          </FormControl>
          <FormControl>
            <FormLabel>
              &#123;QUEUE_MESSAGE&#125; variable when the queue is empty
            </FormLabel>
            <Input
              name="queueEmptyMessage"
              onChange={props.onInputChange}
              value={props.organization.queueEmptyMessage}
            />
          </FormControl>
        </>
      );
    case 'notAcceptingMessage':
      return (
        <>
          <Textarea
            resize="none"
            name="notAcceptingMessage"
            onChange={props.onInputChange}
            value={props.organization.notAcceptingMessage}
          />
          <FormHelperText>
            The message sent to customers when your waitlist is not accepting
            new customers
          </FormHelperText>
        </>
      );
    default:
      return (
        <Input
          onChange={props.onInputChange}
          name={props.message}
          value={props.organization[props.message]}
        />
      );
  }
}

MessageForm.propTypes = {
  message: PropTypes.string.isRequired,
  organization: PropTypes.object.isRequired,
  onInputChange: PropTypes.func.isRequired
};

const DEFAULT_KEYWORD = 'REMOVE';

export default function OrganizationSettings(props) {
  const [message, setMessage] = useState('welcomeMessage');
  const [organization, setOrganization] = useState(props.data.organization);

  function handleSubmit(event) {
    event.preventDefault();
  }

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
        <Box mx="auto" maxW="containers.lg" as="form" onSubmit={handleSubmit}>
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
              <FormHelperText>This can&apos;t be changed</FormHelperText>
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
                placeholder={DEFAULT_KEYWORD}
                onChange={handleInputChange}
                value={organization.keyword}
              />
              <FormHelperText>
                The keyword that your customers can text to remove themselves
                from your waitlist (case-insensitive)
              </FormHelperText>
            </FormControl>
          </Stack>
          <Flex align="flex-start">
            <Box flexShrink="0" mr="4" w="full" maxW="containers.sm">
              <Select onChange={handleMessageChange} value={message}>
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
                  ? organization.keyword || DEFAULT_KEYWORD
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
          <Button type="submit" size="lg" variantColor="green">
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
