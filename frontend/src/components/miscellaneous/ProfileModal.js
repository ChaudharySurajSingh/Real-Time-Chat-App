import React from 'react'
import {Button, IconButton, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useDisclosure} from '@chakra-ui/react';
import {ViewIcon} from '@chakra-ui/icons';

const ProfileModal = ({user, children}) => {
  const {isOpen, onOpen, onClose} = useDisclosure()
  return (
    <>
    {
      children?(<span onClick={onOpen}>{children}</span>):(
        <IconButton
        display={{base: 'flex'} }
        icon={<ViewIcon />}
        onClick={onOpen}
        />
      )}
      <Modal size={'xs'} isOpen={isOpen} onClose={onClose}
      isCentered
      >
        <ModalOverlay />
        <ModalContent height={'-webkit-fit-content'} width={'-webkit-fit-content'}> 
          <ModalHeader
          textAlign={'center'}
          fontSize={'xl'}
          fontStyle={'italic'}
          fontWeight={'bold'}
          display='flex'
          justifyContent='center'
          >{user.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody
          display={'flex'}
          alignItems={'center'}
          flexDirection={'column'}
          justifyContent={'space-between'}
          >
            <Image 
            borderRadius={'full'}
            marginTop={'1px'}
            boxSize={'150px'}
            src={user.pic}
            alt={user.name}
            />
            <Text
            fontSize={{base:"15px", md:'17px'}}
            fontStyle={'italic'}
            textDecor={'underline'}
            textColor={'green'}>
            {user.email}</Text>
          </ModalBody>

          <ModalFooter>
            {/* <Button colorScheme='blue' mr={3} onClick={onClose}>
              Close
            </Button> */}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default ProfileModal