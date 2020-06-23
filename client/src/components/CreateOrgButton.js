import CreateOrgForm from './CreateOrgForm';
import React, {useState} from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader
} from '@chakra-ui/core';

export default function CreateOrgButton() {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setModalOpen(true)}>Create org</Button>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <ModalContent>
          <ModalHeader>New organization</ModalHeader>
          <ModalCloseButton />
          <CreateOrgForm bodyWrapper={ModalBody} buttonWrapper={ModalFooter} />
        </ModalContent>
      </Modal>
    </>
  );
}
