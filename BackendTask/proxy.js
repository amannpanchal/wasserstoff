const http = require("http");
const httpProxy = require("http-proxy");
const app = require("./server");

// Number of instances to run
const NUM_SERVERS = 20;

// List of ports for the instances
const ports = Array.from({ length: NUM_SERVERS }, (_, index) => 4001 + index);

// Create proxy server
const proxy = httpProxy.createProxyServer();

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

// Round-robin index
let currentIndex = 0;

// Create a server to handle incoming requests
const proxyServer = http.createServer((req, res) => {
  // Round-robin load balancing
  const { server } = servers[currentIndex % NUM_SERVERS];
  currentIndex += 1;

  // Log the port in console
  console.log(`Request handled by port ${server.address().port}`);

  // Proxy the request to the chosen server
  proxy.web(
    req,
    res,
    { target: `http://localhost:${server.address().port}` },
    (err) => {
      console.error("Proxy error:", err);
      res.writeHead(502);
      res.end("Bad Gateway");
    }
  );

  // Optionally, include server port in the response
  // You can set a custom header or modify the response body
  res.setHeader("X-Server-Port", server.address().port);
});

const PROXY_PORT = process.env.PROXY_PORT || 4000;
proxyServer.listen(PROXY_PORT, () => {
  console.log(`Proxy server running on port ${PROXY_PORT}`);
});
