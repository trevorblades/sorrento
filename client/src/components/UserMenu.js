import PropTypes from 'prop-types';
import React, {useContext, useState} from 'react';
import {
  Avatar,
  Box,
  Button,
  Link,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  Textarea
} from '@chakra-ui/core';
import {FaCaretDown, FaCog, FaSignOutAlt} from 'react-icons/fa';
import {Link as GatsbyLink} from 'gatsby';
import {LogOutContext} from '../utils';
import {gql, useQuery} from '@apollo/client';

const GET_ORG_DETAILS = gql`
  query GetOrgDetails($id: ID!) {
    organization(id: $id) {
      welcomeMessage
    }
  }
`;

function OrgSettingsForm({queryOptions}) {
  const {data, loading, error} = useQuery(GET_ORG_DETAILS, queryOptions);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (loading) {
    return <Text color="red.500">{error.message}</Text>;
  }

  return (
    <>
      <ModalBody>
        <Textarea
          resize="none"
          placeholder="Welcome message"
          defaultValue={data.organization.welcomeMessage}
        />
      </ModalBody>
      <ModalFooter>
        <Button>Save changes</Button>
      </ModalFooter>
    </>
  );
}

OrgSettingsForm.propTypes = {
  queryOptions: PropTypes.object.isRequired
};

export default function UserMenu(props) {
  const logOut = useContext(LogOutContext);
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <>
      <Menu>
        <MenuButton
          as={Button}
          color="white"
          variant="ghost"
          size="sm"
          px="none"
          _hover={{bg: 'gray.800'}}
          _active={{bg: 'gray.700'}}
        >
          <Avatar mr="2" size="sm" fontSize="md" name={props.user.name} />
          <FaCaretDown />
        </MenuButton>
        <MenuList shadow="lg" pt="none" placement="bottom-end">
          <Stack p="4" spacing="2" bg="gray.50" align="center">
            <Avatar name={props.user.name} />
            <Box fontSize="sm" textAlign="center">
              <Text>{props.user.name}</Text>
              <Text color="gray.500">{props.user.email}</Text>
            </Box>
          </Stack>
          <MenuDivider mt="none" />
          <Box px="4" py="2">
            <Text>{props.organization.name}</Text>
            <Link fontSize="sm" color="blue.500" as={GatsbyLink} to="/app">
              Change organization
            </Link>
          </Box>
          <MenuDivider />
          <MenuItem onClick={() => setModalOpen(true)}>
            <Box as={FaCog} mr="2" />
            Organization settings
          </MenuItem>
          <MenuItem onClick={logOut}>
            <Box as={FaSignOutAlt} mr="2" />
            Log out
          </MenuItem>
        </MenuList>
      </Menu>
      <Modal size="2xl" isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{props.organization.name}</ModalHeader>
          <ModalCloseButton />
          <OrgSettingsForm
            queryOptions={{
              variables: {
                id: props.organization.id
              }
            }}
          />
        </ModalContent>
      </Modal>
    </>
  );
}

UserMenu.propTypes = {
  user: PropTypes.object.isRequired,
  organization: PropTypes.object.isRequired
};
