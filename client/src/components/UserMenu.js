import OrgSettingsModalContent from './OrgSettingsModalContent';
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
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text
} from '@chakra-ui/core';
import {FaCaretDown, FaCog, FaSignOutAlt} from 'react-icons/fa';
import {Link as GatsbyLink} from 'gatsby';
import {LogOutContext} from '../utils';

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
      <Modal
        closeOnOverlayClick={false}
        size="3xl"
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Organization settings</ModalHeader>
          <ModalCloseButton />
          <OrgSettingsModalContent
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
