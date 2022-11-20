import { rule, shield } from "graphql-shield";

const isAuthenticated = rule({ cache: "contextual" })(
  (_, __, { user }) => user !== null
);

export const permissions = shield({
  Query: {
    customers: isAuthenticated,
  },
  Mutation: {
    "*": isAuthenticated,
  },
});
