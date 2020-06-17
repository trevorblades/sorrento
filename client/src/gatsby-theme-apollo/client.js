import fetch from 'isomorphic-fetch';
import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  split
} from '@apollo/client';
import {WebSocketLink} from '@apollo/link-ws';
import {getMainDefinition} from '@apollo/client/utilities';

const httpLink = new HttpLink({
  uri: `${process.env.GATSBY_API_URL}/graphql`,
  fetch
});

const authLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('sorrento:token');
  if (token) {
    operation.setContext({
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return forward(operation);
});

let link = authLink.concat(httpLink);
if (process.browser) {
  link = split(
    ({query}) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    new WebSocketLink({
      uri: 'ws://localhost:4000/graphql',
      options: {
        reconnect: true,
        connectionParams: () => ({
          authToken: localStorage.getItem('sorrento:token')
        })
      }
    }),
    link
  );
}

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  resolvers: {
    Query: {
      isLoggedIn: () => Boolean(localStorage.getItem('sorrento:token'))
    }
  }
});

export default client;
