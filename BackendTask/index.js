const http = require("http");
const httpProxy = require("http-proxy");
const app = require("./server");

// Number of instances to run
const NUM_SERVERS = 20;

// List of ports for the instances
const ports = Array.from({ length: NUM_SERVERS }, (_, index) => 4001 + index);

// Create proxy server
const proxy = httpProxy.createProxyServer();

// Queues for different strategies
const queues = {
  fifo: [],
  priority: [],
  roundRobinIndex: 0,
};

// Create an array to hold server instances
const servers = ports.map((port) => {
  const server = http.createServer(app);

  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  return {
    port,
    server,
  };
});

// Round-robin function
function getNextRoundRobinServer() {
  const server = servers[queues.roundRobinIndex % NUM_SERVERS];
  queues.roundRobinIndex += 1;
  return server;
}

// Handle incoming requests
function handleRequest(req, res, strategy) {
  let targetServer;

  // Determine target server based on strategy
  switch (strategy) {
    case "fifo":
      queues.fifo.push({ req, res });
      console.log(`FIFO queue length: ${queues.fifo.length}`);
      targetServer = getNextRoundRobinServer();
      break;
    case "priority":
      // For simplicity, assuming priority-based on request properties or headers
      queues.priority.push({ req, res });
      console.log(`Priority queue length: ${queues.priority.length}`);
      targetServer = getNextRoundRobinServer();
      break;
    case "round-robin":
      targetServer = getNextRoundRobinServer();
      break;
    default:
      // Default to round-robin if strategy not recognized
      targetServer = getNextRoundRobinServer();
  }

  // Proxy the request to the chosen server
  proxy.web(
    req,
    res,
    { target: `http://localhost:${targetServer.port}` },
    (err) => {
      console.error("Proxy error:", err);
      res.writeHead(502);
      res.end("Bad Gateway");
    }
  );

  // Log the request and strategy used
  console.log(
    `Request handled by port ${targetServer.port} using ${strategy} strategy`
  );
}

// Create a server to handle incoming requests
const proxyServer = http.createServer((req, res) => {
  // Example: Use query parameter or header to determine strategy
  const strategy = req.headers["x-request-strategy"] || "round-robin";

  // Log the incoming request and the determined strategy
  console.log(`Incoming request for ${req.url} using ${strategy} strategy`);

  // Handle the request based on the chosen strategy
  handleRequest(req, res, strategy);
});

const PROXY_PORT = process.env.PROXY_PORT || 4000;
proxyServer.listen(PROXY_PORT, () => {
  console.log(`Proxy server running on port ${PROXY_PORT}`);
});
