import PhoneNumbers from './PhoneNumbers';
import React, {Fragment, useState} from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Text,
  useTheme
} from '@chakra-ui/core';
import {CardElement, useElements, useStripe} from '@stripe/react-stripe-js';
import {LIST_ORGANIZATIONS, ORGANIZATION_FRAGMENT} from '../utils';
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

export default function CreateOrgForm(props) {
  const stripe = useStripe();
  const elements = useElements();
  const {fonts, colors} = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [phoneNumbersLoaded, setPhoneNumbersLoaded] = useState(false);

  const [createOrganization] = useMutation(CREATE_ORGANIZATION, {
    update(cache, result) {
      const data = cache.readQuery({query: LIST_ORGANIZATIONS});
      cache.writeQuery({
        query: LIST_ORGANIZATIONS,
        data: {
          ...data,
          organizations: [...data.organizations, result.data.createOrganization]
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
    <form onSubmit={handleSubmit}>
      <props.bodyWrapper>
        <Stack spacing="4">
          {error && <Text color="red.500">{error.message}</Text>}
          <Input name="name" placeholder="Organization name" isRequired />
          <FormControl>
            <FormLabel>Select a phone number</FormLabel>
            <PhoneNumbers
              limit={3}
              onCompleted={() => setPhoneNumbersLoaded(true)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Payment options</FormLabel>
            <RadioGroup defaultValue={allStripePlan.nodes[0].id} name="plan">
              {allStripePlan.nodes.map(plan => (
                <Radio key={plan.id} value={plan.id}>
                  ${plan.amount / 100} per {plan.interval}
                </Radio>
              ))}
            </RadioGroup>
          </FormControl>
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
        </Stack>
      </props.bodyWrapper>
      <props.buttonWrapper>
        <Button
          isDisabled={!stripe || !phoneNumbersLoaded}
          isLoading={loading}
          type="submit"
        >
          Create organization
        </Button>
      </props.buttonWrapper>
    </form>
  );
}

CreateOrgForm.defaultProps = {
  bodyWrapper: Fragment,
  buttonWrapper: Fragment
};
