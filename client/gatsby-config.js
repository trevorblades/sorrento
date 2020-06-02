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
      resolve: 'gatsby-source-instagram',
      options: {
        username: 'sorrentobarbers'
      }
    },
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        icon: 'src/assets/icon.svg'
      }
    }
  ]
};
