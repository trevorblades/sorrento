import PropTypes from 'prop-types';
import React from 'react';
import {Button, Heading, Radio, RadioGroup, Text} from '@chakra-ui/core';

export default function CreateOrganization({data, children}) {
  return (
    <>
      <Heading fontSize="3xl">Create an organization</Heading>
      <RadioGroup defaultValue={data.phoneNumbers[0].phoneNumber}>
        {data.phoneNumbers.map(phoneNumber => (
          <Radio key={phoneNumber.phoneNumber} value={phoneNumber.phoneNumber}>
            {phoneNumber.friendlyName}
          </Radio>
        ))}
      </RadioGroup>
      <Text>Payment option: TODO</Text>
      <Button>Create organization</Button>
      {children}
    </>
  );
}

CreateOrganization.propTypes = {
  data: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired
};
