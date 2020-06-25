import ChatPreview from './ChatPreview';
import PropTypes from 'prop-types';
import React, {useState} from 'react';
import isEqual from 'lodash.isequal';
import {
  Button,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  Input,
  ModalBody,
  ModalFooter,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Stack,
  Textarea
} from '@chakra-ui/core';
import {format} from 'phone-fns';

export default function OrgSettingsForm(props) {
  const [organization, setOrganization] = useState(props.organization);

  function handleInputChange(event) {
    const {name, value} = event.target;
    setOrganization(prevOrganization => ({
      ...prevOrganization,
      [name]: value
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    console.log(event.target.queueLimit.value);
  }

  return (
    <form onSubmit={handleSubmit}>
      <ModalBody as={Stack} spacing="4">
        <FormControl>
          <FormLabel>Organization name</FormLabel>
          <Input
            isRequired
            name="name"
            value={organization.name}
            onChange={handleInputChange}
          />
        </FormControl>
        <FormControl>
          <FormLabel>SMS number</FormLabel>
          <Input
            value={format('(NNN) NNN-NNNN', organization.phone.slice(2))}
            isDisabled
          />
        </FormControl>
        <Grid gap="4" templateColumns="repeat(3, 1fr)">
          <FormControl>
            <FormLabel>Queue limit</FormLabel>
            <NumberInput
              min={1}
              max={100}
              value={organization.queueLimit}
              onChange={value =>
                setOrganization(prevOrganization => ({
                  ...prevOrganization,
                  queueLimit: value
                }))
              }
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <FormHelperText>
              Maximum number of people allowed on the waitlist at a time
            </FormHelperText>
          </FormControl>
          <FormControl>
            <FormLabel>Active agents</FormLabel>
            <NumberInput
              min={1}
              value={organization.activeAgents}
              onChange={value =>
                setOrganization(prevOrganization => ({
                  ...prevOrganization,
                  activeAgents: value
                }))
              }
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
              value={organization.averageHandleTime}
              onChange={value =>
                setOrganization(prevOrganization => ({
                  ...prevOrganization,
                  averageHandleTime: value
                }))
              }
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
        </Grid>
        <Divider />
        <Grid alignItems="flex-start" gap="4" templateColumns="2fr 1fr">
          <Stack spacing="4">
            <FormControl>
              <FormLabel>Welcome message template</FormLabel>
              <Textarea
                isRequired
                resize="none"
                name="welcomeMessage"
                value={organization.welcomeMessage}
                onChange={handleInputChange}
              />
              <FormHelperText>
                You may use the QUEUE_MESSAGE and KEYWORD variables
              </FormHelperText>
            </FormControl>
            <FormControl>
              <FormLabel>
                QUEUE_MESSAGE when the <mark>queue is empty</mark>
              </FormLabel>
              <Input
                isRequired
                name="queueEmptyMessage"
                value={organization.queueEmptyMessage}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>
                QUEUE_MESSAGE when there are <mark>people in the queue</mark>
              </FormLabel>
              <Textarea
                isRequired
                resize="none"
                name="queueMessage"
                value={organization.queueMessage}
                onChange={handleInputChange}
              />
              <FormHelperText>
                You may use the IS, PERSON, and ESTIMATED_WAIT_TIME variables
              </FormHelperText>
            </FormControl>
            <Grid templateColumns="repeat(2, 1fr)" gap="4">
              <FormControl>
                <FormLabel>KEYWORD variable</FormLabel>
                <Input
                  isRequired
                  name="keyword"
                  value={organization.keyword}
                  onChange={handleInputChange}
                />
                <FormHelperText>
                  The keyword that your customers can text to remove themselves
                  from your waitlist (case-insensitive)
                </FormHelperText>
              </FormControl>
              <FormControl>
                <FormLabel>PERSON variable</FormLabel>
                <Input
                  isRequired
                  name="person"
                  value={organization.person}
                  onChange={handleInputChange}
                />
                <FormHelperText>
                  The <mark>singular</mark> word you want to use to address
                  people in your waitlist
                </FormHelperText>
              </FormControl>
            </Grid>
            <Divider />
            <FormControl>
              <FormLabel>Not accepting message</FormLabel>
              <Textarea
                isRequired
                resize="none"
                name="notAcceptingMessage"
                value={organization.notAcceptingMessage}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Ready to serve message</FormLabel>
              <Textarea
                isRequired
                resize="none"
                name="readyMessage"
                value={organization.readyMessage}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Limit exceeded message</FormLabel>
              <Input
                isRequired
                name="limitExceededMessage"
                value={organization.limitExceededMessage}
                onChange={handleInputChange}
              />
            </FormControl>
            <Divider />
            <FormControl>
              <FormLabel>Removed message</FormLabel>
              <Input
                isRequired
                name="removedMessage"
                value={organization.removedMessage}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Not removed message</FormLabel>
              <Input
                isRequired
                name="notRemovedMessage"
                value={organization.notRemovedMessage}
                onChange={handleInputChange}
              />
            </FormControl>
          </Stack>
          <ChatPreview organization={organization} />
        </Grid>
      </ModalBody>
      <ModalFooter>
        <Button
          isDisabled={isEqual(props.organization, organization)}
          type="submit"
          variantColor="green"
        >
          Save changes
        </Button>
      </ModalFooter>
    </form>
  );
}

OrgSettingsForm.propTypes = {
  organization: PropTypes.object.isRequired
};
