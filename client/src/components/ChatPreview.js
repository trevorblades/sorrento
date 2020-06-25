import ChatBubble from './ChatBubble';
import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {
  Box,
  Checkbox,
  Grid,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Radio,
  RadioGroup,
  Stack,
  Text
} from '@chakra-ui/core';
import {createWelcomeMessage} from '@w8up/common';

export default function ChatPreview({organization}) {
  const [removing, setRemoving] = useState(false);
  const [peopleAhead, setPeopleAhead] = useState(0);
  const [personOnList, setPersonOnList] = useState(true);
  return (
    <Box
      w="150%"
      bg="white"
      rounded="lg"
      shadow="lg"
      overflow="hidden"
      position="sticky"
      top="16"
    >
      <Box py="3" px="4" bg="gray.900">
        <RadioGroup
          isInline
          color="white"
          mb="2"
          value={removing.toString()}
          onChange={event => setRemoving(event.target.value === 'true')}
        >
          <Radio value="false">Name</Radio>
          <Radio value="true">Remove keyword</Radio>
        </RadioGroup>
        {removing ? (
          <Checkbox
            isChecked={personOnList}
            onChange={event => setPersonOnList(event.target.checked)}
            color="white"
          >
            Person is on the list
          </Checkbox>
        ) : (
          <Grid alignItems="center" templateColumns="repeat(2, 1fr)">
            <Text color="white">People in line</Text>
            <NumberInput
              min={0}
              size="sm"
              onChange={setPeopleAhead}
              value={peopleAhead}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </Grid>
        )}
      </Box>
      <Stack spacing="3" p="6">
        <ChatBubble>{removing ? organization.keyword : 'Bonnie'}</ChatBubble>
        {removing ? (
          <ChatBubble fromThem>
            {personOnList
              ? organization.removedMessage
              : organization.notRemovedMessage}
          </ChatBubble>
        ) : peopleAhead >= organization.queueLimit ? (
          <ChatBubble fromThem>{organization.limitExceededMessage}</ChatBubble>
        ) : (
          [
            <ChatBubble key="welcome" fromThem>
              {createWelcomeMessage(organization, peopleAhead)}
            </ChatBubble>,
            <ChatBubble key="ready" fromThem>
              {organization.readyMessage}
            </ChatBubble>
          ]
        )}
      </Stack>
    </Box>
  );
}

ChatPreview.propTypes = {
  organization: PropTypes.object.isRequired
};
