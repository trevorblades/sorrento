import ChatBubble from './ChatBubble';
import PropTypes from 'prop-types';
import React from 'react';
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
  Stack,
  Textarea
} from '@chakra-ui/core';
import {format} from 'phone-fns';

export default function OrganizationSettings({data}) {
  function handleSubmit(event) {
    event.preventDefault();
  }

  return (
    <Box p={[5, 6]}>
      <Box mx="auto" maxW="containers.sm" as="form" onSubmit={handleSubmit}>
        <Heading mb="6" fontSize="3xl">
          Organization settings
        </Heading>
        <Stack spacing="4">
          <FormControl>
            <FormLabel>Organization name</FormLabel>
            <Input defaultValue={data.organization.name} />
          </FormControl>
          <FormControl>
            <FormLabel>SMS number</FormLabel>
            <Input
              value={format('(NNN) NNN-NNNN', data.organization.phone.slice(2))}
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
              defaultValue={data.organization.queueLimit}
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
              defaultValue={data.organization.activeAgents}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <FormHelperText>
              The number of people available to serve customers at any moment
            </FormHelperText>
          </FormControl>
          <FormControl>
            <FormLabel>Average handle time</FormLabel>
            <NumberInput
              min={1}
              name="averageHandleTime"
              isRequired
              defaultValue={data.organization.averageHandleTime}
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
          {/* TODO: add select to switch between messages and update the chat bubbles */}
          <Flex
            flexGrow="1"
            maxW="450px"
            direction="column"
            px="26px"
            overflow="hidden"
            mx="auto"
            w="full"
          >
            <ChatBubble>Bonnie - prefer Andrew</ChatBubble>
            <ChatBubble fromThem>
              {data.organization.notAcceptingMessage}
            </ChatBubble>
          </Flex>
          <FormControl>
            <FormLabel>Welcome message</FormLabel>
            <Textarea
              isRequired
              resize="none"
              defaultValue={data.organization.welcomeMessage}
            />
            <FormHelperText>
              You may use the &#123;KEYWORD&#125; and &#123;QUEUE_MESSAGE&#125;
              variables in this message
            </FormHelperText>
          </FormControl>
          <FormControl>
            <FormLabel>&#123;KEYWORD&#125; variable</FormLabel>
            <Input isRequired defaultValue={data.organization.keyword} />
            <FormHelperText>
              The keyword that your customers can text to remove themselves from
              your waitlist (case-insensitive)
            </FormHelperText>
          </FormControl>
          <FormControl>
            <FormLabel>
              &#123;QUEUE_MESSAGE&#125; variable when there are people in the
              queue
            </FormLabel>
            <Textarea
              isRequired
              resize="none"
              defaultValue={data.organization.queueMessage}
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
            <Input defaultValue={data.organization.queueEmptyMessage} />
          </FormControl>
          <FormControl>
            <FormLabel>Not-accepting message</FormLabel>
            <Textarea
              isRequired
              resize="none"
              defaultValue={data.organization.notAcceptingMessage}
            />
            <FormHelperText>
              The message sent to customers when your waitlist is not accepting
              new customers
            </FormHelperText>
          </FormControl>
          <FormControl>
            <FormLabel>Removed message</FormLabel>
            <Input defaultValue={data.organization.removedMessage} />
          </FormControl>
          <FormControl>
            <FormLabel>Not-removed message</FormLabel>
            <Input defaultValue={data.organization.notRemovedMessage} />
          </FormControl>
          <FormControl>
            <FormLabel>Limit exceeded message</FormLabel>
            <Input defaultValue={data.organization.limitExceededMessage} />
          </FormControl>
        </Stack>
        <Box mt="6" textAlign="right">
          <Button type="submit" size="lg" variantColor="green">
            Save changes
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

OrganizationSettings.propTypes = {
  data: PropTypes.object.isRequired
};
