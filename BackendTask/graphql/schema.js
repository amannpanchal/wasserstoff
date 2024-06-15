const { buildSchema } = require("graphql");

// Define the GraphQL schema
const schema = buildSchema(`
  type Query {
    fast: String
    slow: String
    payload(input: String!): String
  }
`);

module.exports = schema;
