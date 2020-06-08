module.exports = {
  plugins: [
    'gatsby-plugin-react-helmet',
    'gatsby-theme-apollo',
    {
      resolve: 'gatsby-plugin-chakra-ui',
      options: {
        isUsingColorMode: false
      }
    },
    {
      resolve: 'gatsby-plugin-create-client-paths',
      options: {
        prefixes: ['/app/*']
      }
    }
  ]
};
