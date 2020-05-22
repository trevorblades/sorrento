import {theme} from '@chakra-ui/core';

const body = "'Helvetica Neue', Helvetica, sans-serif";

export default {
  ...theme,
  fonts: {
    body,
    heading: body,
    mono: 'monospace'
  }
};
