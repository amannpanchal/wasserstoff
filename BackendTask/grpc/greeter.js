const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

// Load the protobuf
const packageDefinition = protoLoader.loadSync(
  path.join(__dirname, "greeter.proto"),
  {}
);
const greeterProto = grpc.loadPackageDefinition(packageDefinition).Greeter;

// Implement the gRPC methods
const server = new grpc.Server();
server.addService(greeterProto.Greeter.service, {
  Fast: (call, callback) => {
    callback(null, { message: "Fast response" });
  },
  Slow: (call, callback) => {
    setTimeout(() => {
      callback(null, { message: "Slow response" });
    }, 5000);
  },
});

// Start the gRPC server
const address = "127.0.0.1:50051";
server.bind(address, grpc.ServerCredentials.createInsecure());
console.log(`gRPC server running at ${address}`);
server.start();
