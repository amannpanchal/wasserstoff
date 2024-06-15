const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

// Load the gRPC client
const packageDefinition = protoLoader.loadSync(
  path.join(__dirname, "../grpc/greeter.proto"),
  {}
);
const greeterProto = grpc.loadPackageDefinition(packageDefinition).Greeter;
const grpcClient = new greeterProto(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

// Middleware for dynamic routing
const dynamicRouter = (req, res, next) => {
  const contentType = req.headers["content-type"];
  const payloadSize = parseInt(req.headers["content-length"]) || 0;
  const customCriteria = req.query.customCriteria;

  // Custom criteria routing
  if (customCriteria) {
    res.send({
      message: "Handled by custom criteria",
      criteria: customCriteria,
    });
    return;
  }

  // Routing based on API type
  if (req.path.startsWith("/api/rest")) {
    next(); // Continue to REST routes
  } else if (req.path.startsWith("/api/graphql")) {
    next(); // Continue to GraphQL handler
  } else if (req.path.startsWith("/api/grpc")) {
    const method = req.path.split("/").pop();
    grpcClient[method]({}, (error, response) => {
      if (error) {
        res.status(500).send(error);
      } else {
        res.send(response);
      }
    });
  } else if (contentType === "application/json" && payloadSize < 1000) {
    // Custom criteria: JSON payload and small size
    res.send({ message: "Handled by custom criteria: small JSON payload" });
  } else if (contentType === "application/json" && payloadSize >= 1000) {
    // Custom criteria: JSON payload and large size
    res.send({ message: "Handled by custom criteria: large JSON payload" });
  } else {
    res.status(404).send({ message: "Route not found" });
  }
};

module.exports = dynamicRouter;
