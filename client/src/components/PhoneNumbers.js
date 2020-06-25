import PropTypes from 'prop-types';
import React from 'react';
import {Radio, RadioGroup, Skeleton, Text} from '@chakra-ui/core';
import {gql, useQuery} from '@apollo/client';

const LIST_PHONE_NUMBERS = gql`
  query ListPhoneNumbers($limit: Int!) {
    phoneNumbers(limit: $limit) {
      friendlyName
      phoneNumber
    }
  }
`;

export default function PhoneNumbers({limit, onCompleted}) {
  const {data, loading, error} = useQuery(LIST_PHONE_NUMBERS, {
    onCompleted,
    variables: {
      limit
    }
  });

  if (loading) {
    return (
      <RadioGroup key="loading">
        {Array(limit)
          .fill('(000) 000-0000')
          .map((number, index) => (
            <Radio isDisabled key={index}>
              <Skeleton>{number}</Skeleton>
            </Radio>
          ))}
      </RadioGroup>
    );
  }

  if (error) {
    return <Text color="red.500">{error.message}</Text>;
  }

  return (
    <RadioGroup name="phone" defaultValue={data.phoneNumbers[0].phoneNumber}>
      {data.phoneNumbers.map(phoneNumber => (
        <Radio key={phoneNumber.phoneNumber} value={phoneNumber.phoneNumber}>
          {phoneNumber.friendlyName}
        </Radio>
      ))}
    </RadioGroup>
  );
}

PhoneNumbers.propTypes = {
  limit: PropTypes.number.isRequired,
  onCompleted: PropTypes.func.isRequired
};
