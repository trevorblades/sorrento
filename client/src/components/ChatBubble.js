import PropTypes from 'prop-types';
import React from 'react';
import {Box} from '@chakra-ui/core';

function ChatBubbleTail(props) {
  return <Box position="absolute" bottom="-2px" h="20px" {...props} />;
}

export default function ChatBubble(props) {
  const color = props.fromThem ? 'gray.200' : 'blue.400';
  const backTailProps = {
    [props.fromThem ? 'left' : 'right']: '-7px',
    [`border${props.fromThem ? 'Left' : 'Right'}Color`]: color,
    [`border${props.fromThem ? 'Left' : 'Right'}Width`]: '20px',
    [`borderBottom${props.fromThem ? 'Right' : 'Left'}Radius`]: '16px 14px'
  };

  const frontTailProps = {
    [props.fromThem ? 'left' : 'right']: props.fromThem ? '4px' : '-56px',
    [`borderBottom${props.fromThem ? 'Right' : 'Left'}Radius`]: '10px'
  };

  return (
    <Box
      bg={color}
      rounded="25px"
      py="10px"
      maxW="255px"
      px="20px"
      fontSize="20px"
      lineHeight="24px"
      position="relative"
      mb="12px"
      color={props.fromThem ? undefined : 'white'}
      alignSelf={props.fromThem ? 'flex-start' : 'flex-end'}
      wordBreak="break-word"
    >
      {props.children}
      <ChatBubbleTail transform="translate(0, -2px)" {...backTailProps} />
      <ChatBubbleTail
        w="26px"
        bg="white"
        transform="translate(-30px, -2px)"
        {...frontTailProps}
      />
    </Box>
  );
}

ChatBubble.propTypes = {
  fromThem: PropTypes.bool,
  children: PropTypes.node.isRequired
};
