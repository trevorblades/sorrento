import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {APP_QUERY, ORGANIZATION_FRAGMENT} from '../utils';
import {
  Box,
  Button,
  Heading,
  Input,
  Radio,
  RadioGroup,
  Text,
  useTheme
} from '@chakra-ui/core';
import {CardElement, useElements, useStripe} from '@stripe/react-stripe-js';
import {gql, useMutation} from '@apollo/client';
import {graphql, useStaticQuery} from 'gatsby';

const CREATE_ORGANIZATION = gql`
  mutation CreateOrganization($input: CreateOrganizationInput!) {
    createOrganization(input: $input) {
      ...OrganizationFragment
    }
  }
  ${ORGANIZATION_FRAGMENT}
`;

export default function CreateOrganization({data, children}) {
  const stripe = useStripe();
  const elements = useElements();
  const {fonts, colors} = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [createOrganization] = useMutation(CREATE_ORGANIZATION, {
    update(cache, {data}) {
      const {me} = cache.readQuery({query: APP_QUERY});
      cache.writeQuery({
        query: APP_QUERY,
        data: {
          me,
          organization: data.createOrganization
        }
      });
    }
  });

  const {allStripePlan} = useStaticQuery(
    graphql`
      {
        allStripePlan {
          nodes {
            id
            amount
            currency
            interval
          }
        }
      }
    `
  );

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);

    try {
      const {name, phone, plan} = event.target;
      const element = elements.getElement(CardElement);
      const result = await stripe.createToken(element);

      if (result.error) {
        throw result.error;
      }

      await createOrganization({
        variables: {
          input: {
            name: name.value,
            phone: phone.value,
            source: result.token.id,
            plan: plan.value
          }
        }
      });
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  }

  return (
    <Box
      w="full"
      maxW="containers.sm"
      m="auto"
      as="form"
      onSubmit={handleSubmit}
    >
      <Heading fontSize="3xl">Create an organization</Heading>
      {error && <Text color="red.500">{error.message}</Text>}
      <Input name="name" placeholder="Organization name" isRequired />
      <Heading fontSize="2xl">Select a phone number</Heading>
      <RadioGroup name="phone" defaultValue={data.phoneNumbers[0].phoneNumber}>
        {data.phoneNumbers.map(phoneNumber => (
          <Radio key={phoneNumber.phoneNumber} value={phoneNumber.phoneNumber}>
            {phoneNumber.friendlyName}
          </Radio>
        ))}
      </RadioGroup>
      <Heading fontSize="2xl">Payment options</Heading>
      <RadioGroup defaultValue={allStripePlan.nodes[0].id} name="plan">
        {allStripePlan.nodes.map(plan => (
          <Radio key={plan.id} value={plan.id}>
            ${plan.amount / 100} per {plan.interval}
          </Radio>
        ))}
      </RadioGroup>
      <Box w="full" px="4" bg="white" rounded="md" borderWidth="1px">
        <CardElement
          options={{
            style: {
              base: {
                lineHeight: '46px',
                fontFamily: fonts.body,
                fontSize: '18px',
                color: colors.gray[800],
                '::placeholder': {
                  color: colors.gray[400]
                }
              }
            }
          }}
        />
      </Box>
      <Button isDisabled={!stripe} isLoading={loading} type="submit">
        Create organization
      </Button>
      {children}
    </Box>
  );
}

CreateOrganization.propTypes = {
  data: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired
};
