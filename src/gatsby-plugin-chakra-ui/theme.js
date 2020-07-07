import merge from 'lodash.merge';
import theme from '@chakra-ui/theme';

export default merge(theme, {
  components: {
    Heading: {
      baseStyle: {
        textTransform: 'uppercase'
      }
    }
  }
});
