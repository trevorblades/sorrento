import { allow, rule, shield } from "graphql-shield";

const isAuthenticated = rule({ cache: "contextual" })(
  (_, __, { user }) => user !== null
);

export const permissions = shield(
  {
    Query: {
      "*": isAuthenticated,
      me: allow,
    },
    Mutation: {
      "*": isAuthenticated,
      logIn: allow,
    },
  },
  {
    allowExternalErrors: true,
  }
);
