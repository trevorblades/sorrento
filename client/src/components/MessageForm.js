import PropTypes from 'prop-types';
import React from 'react';
import {
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Stack,
  Textarea
} from '@chakra-ui/core';

export default function MessageForm(props) {
  switch (props.message) {
    case 'welcomeMessage':
      return (
        <Stack spacing="4">
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
        </Stack>
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
