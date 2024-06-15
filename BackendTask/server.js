const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const schema = require("./graphql/schema");
const resolvers = require("./graphql/resolvers");
const restRoutes = require("./rest/routes");
const logMiddleware = require("./middleware/logger");
const dynamicRouter = require("./middleware/dynamicRouter");

const app = express();

// Middleware for logging
app.use(logMiddleware);

// Middleware for parsing JSON
app.use(express.json());

// Dynamic routing middleware
app.use(dynamicRouter);

// REST API routes
app.use("/api/rest", restRoutes);

// GraphQL API route
app.use(
  "/api/graphql",
  graphqlHTTP({
    schema,
    rootValue: resolvers,
    graphiql: true,
  })
);

// Export the app so it can be used elsewhere (e.g., in server.js)
module.exports = app;
