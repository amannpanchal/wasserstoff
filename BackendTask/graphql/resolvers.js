const resolvers = {
  fast: () => "Fast response",
  slow: () =>
    new Promise((resolve) => setTimeout(() => resolve("Slow response"), 5000)),
  payload: ({ input }) => `Received payload: ${input}`,
};

module.exports = resolvers;
